// backend/node/src/controllers/authController.js
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import ENV from '../config/env.js'
import globalLogger from '../logging/globalLogger.js'
import {
  checkUserExists,
  findUserByUsername,
  createNewUser,
} from '../services/authService.js'
import { CODES } from '../constants/codes.js'
import { throwError, sendResponse } from '../utils/generalFunctions.js'
import {
  validateUsername,
  validatePassword,
  validateDBInstance,
} from '../utils/validators.js'

/**
 * POST /api/auth/login
 * Controlador encargado de realizar el login comprobando el usuario y la contraseña proporcionados.
 */
export async function login(req, res, next) {
  const logger = req.logger || globalLogger
  const db = req.db || null

  logger.debug(
    { body: req.body },
    'authController.js => login() => Solicitud de login recibida'
  )

  try {
    const username = validateUsername(req.body.username)
    const password = req.body.password || ''

    if (typeof password !== 'string' || password === '') {
      logger.warn('authController.js => login() => Contraseña no proporcionada')
      throwError(CODES.PASSWORD_REQUIRED.CODE, CODES.PASSWORD_REQUIRED.MESSAGE)
    }

    validateDBInstance(db)
    logger.debug('authController.js => login() => Conexión a DB validada')

    const usuarios = await findUserByUsername(db, username.trim())
    logger.debug(
      { cantidad: usuarios.length },
      'authController.js => login() => Usuarios encontrados con ese username'
    )

    if (usuarios.length !== 1) {
      logger.warn(
        { username },
        'authController.js => login() => Usuario no encontrado o múltiples coincidencias'
      )
      throwError(
        CODES.INVALID_CREDENTIALS.CODE,
        CODES.INVALID_CREDENTIALS.MESSAGE
      )
    }

    const user = usuarios[0]
    const autenticado = await bcrypt.compare(password, user.password)

    if (!autenticado) {
      logger.warn(
        { username },
        'authController.js => login() => Contraseña incorrecta'
      )
      throwError(
        CODES.INVALID_CREDENTIALS.CODE,
        CODES.INVALID_CREDENTIALS.MESSAGE
      )
    }

    const sessionID = crypto.randomUUID()
    const token = jwt.sign(
      {
        id: user?.id,
        username: username,
        sessionID,
        rol: user?.rol,
        name: user?.nombre,
      },
      ENV.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 2,
    })

    logger.info(
      { id: user?.id, username, sessionID, rol: user?.rol },
      'authController.js => login() => Usuario autenticado correctamente'
    )
    sendResponse(res, { token }, 'Login Correcto')
  } catch (err) {
    logger.error({ err }, 'authController.js => login() => Error durante login')
    next(err)
  }
}

/**
 * POST /api/auth/register
 * Controlador encargado de registrar un nuevo usuario.
 */
export async function register(req, res, next) {
  const logger = req.logger || globalLogger
  const db = req.db || null

  logger.debug(
    { body: req.body },
    'authController.js => register() => Solicitud de registro recibida'
  )

  try {
    const username = validateUsername(req.body.username)
    const password = validatePassword(req.body.password)
    const rol = req.body.rol || 'default'
    const name = req.body.name || username

    validateDBInstance(db)
    logger.debug('authController.js => register() => Conexión a DB validada')

    const exists = await checkUserExists(db, username)
    if (exists) {
      logger.warn(
        { username },
        'authController.js => register() => El nombre de usuario ya está en uso'
      )
      throwError(
        CODES.USER_ALREADY_EXISTS.CODE,
        CODES.USER_ALREADY_EXISTS.MESSAGE
      )
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password.trim(), saltRounds)
    logger.debug(
      'authController.js => register() => Contraseña hasheada correctamente'
    )

    const newUser = await createNewUser(
      db,
      username.trim(),
      hashedPassword,
      rol,
      name
    )

    if (!newUser) {
      logger.error(
        'authController.js => register() => No se pudo crear el usuario en la base de datos'
      )
      throwError(
        CODES.USER_CREATION_FAILED.CODE,
        CODES.USER_CREATION_FAILED.MESSAGE
      )
    }

    const sessionID = crypto.randomUUID()
    const token = jwt.sign(
      {
        id: newUser?.id,
        username: username,
        sessionID,
        rol: newUser?.rol,
        name: newUser?.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 2,
    })

    logger.info(
      { username },
      'authController.js => register() => Usuario registrado correctamente'
    )
    sendResponse(res, { token }, 'Registro Correcto')
  } catch (err) {
    logger.error(
      { err },
      'authController.js => register() => Error durante registro'
    )
    next(err)
  }
}
