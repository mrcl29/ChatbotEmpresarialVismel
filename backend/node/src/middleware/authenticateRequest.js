// backend/node/src/middleware/authenticateRequest.js
import jwt from 'jsonwebtoken'
import ENV from '../config/env.js'
import globalLogger from '../logging/globalLogger.js'
import { throwError } from '../utils/generalFunctions.js'
import { CODES } from '../constants/codes.js'

/**
 * Middleware para autenticar al usuario a partir del token JWT.
 */
const authenticateRequest = (req, res, next) => {
  const logger = req.logger || globalLogger

  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

  if (!token) {
    logger.warn('authenticateRequest => Token no proporcionado.')
    return next(
      throwError(CODES.TOKEN_REQUIRED.CODE, CODES.TOKEN_REQUIRED.MESSAGE)
    )
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET)

    if (!decoded || !decoded.username) {
      logger.warn('authenticateRequest => Token sin información de usuario.')
      return next(
        throwError(CODES.INVALID_TOKEN.CODE, CODES.INVALID_TOKEN.MESSAGE)
      )
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      rol: decoded.rol,
      sessionID: decoded.sessionID,
    }
    logger.info(
      { username: decoded.username },
      'authenticateRequest => Usuario autenticado correctamente.'
    )
    next()
  } catch (err) {
    logger.warn({ err }, 'authenticateRequest => Token inválido o expirado.')
    return next(
      throwError(
        CODES.TOKEN_EXPIRED_OR_INVALID.CODE,
        CODES.TOKEN_EXPIRED_OR_INVALID.MESSAGE
      )
    )
  }
}

export default authenticateRequest
