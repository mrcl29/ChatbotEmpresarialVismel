// backend/node/src/controllers/userController.js
import globalLogger from '../logging/globalLogger.js'
import {
  getAllUsers,
  getAllRoles,
  updateUsersBulk,
  updateUser,
} from '../services/userService.js'
import { CODES } from '../constants/codes.js'
import { throwError, sendResponse } from '../utils/generalFunctions.js'
import { validateDBInstance, validateArrayEntry } from '../utils/validators.js'

/**
 * GET /api/users
 * Obtener todos los usuarios.
 */
export async function getAllUsersController(req, res, next) {
  const logger = req.logger || globalLogger
  const db = req.db || null

  logger.debug(
    { body: req.body },
    'userController.js => getAllUsersController() => Solicitud para obtener usuarios recibida'
  )

  try {
    validateDBInstance(db)
    logger.debug(
      'userController.js => getAllUsersController() => Conexión a DB validada'
    )

    const usuarios = await getAllUsers(db)
    logger.debug(
      { cantidad: usuarios.length },
      'userController.js => getAllUsersController() => Usuarios obtenidos de la base de datos'
    )

    if (usuarios.length === 0) {
      logger.info(
        'userController.js => getAllUsersController() => No hay usuarios en la base de datos'
      )
    } else {
      logger.info(
        { cantidad: usuarios.length },
        'userController.js => getAllUsersController() => Usuarios encontrados correctamente'
      )
    }

    sendResponse(res, { usuarios })
  } catch (err) {
    logger.error(
      { err },
      'userController.js => getAllUsersController() => Error obteniendo los usuarios'
    )
    next(err)
  }
}

/**
 * GET /api/users/roles
 * Obtener todos los roles disponibles.
 */
export async function getAllRolesController(req, res, next) {
  const logger = req.logger || globalLogger
  const db = req.db || null

  logger.debug(
    { body: req.body },
    'userController.js => getAllRolesController() => Solicitud para obtener roles recibida'
  )

  try {
    validateDBInstance(db)
    logger.debug(
      'userController.js => getAllRolesController() => Conexión a DB validada'
    )

    const roles = await getAllRoles(db)
    logger.debug(
      { cantidad: roles.length },
      'userController.js => getAllRolesController() => Roles obtenidos de la base de datos'
    )

    if (roles.length === 0) {
      logger.info(
        'userController.js => getAllRolesController() => No hay roles en la base de datos'
      )
    } else {
      logger.info(
        { cantidad: roles.length },
        'userController.js => getAllRolesController() => Roles encontrados correctamente'
      )
    }

    sendResponse(res, { roles })
  } catch (err) {
    logger.error(
      { err },
      'userController.js => getAllRolesController() => Error al obtener roles'
    )
    next(err)
  }
}

/**
 * PATCH /api/users
 * Actualizar uno o varios usuarios.
 */
export async function updateUsersController(req, res, next) {
  const logger = req.logger || globalLogger
  const db = req.db || null

  logger.debug(
    { body: req.body },
    'userController.js => updateUsersController() => Solicitud para actualizar usuarios'
  )

  try {
    const rawUsers = validateArrayEntry(req.body.users)

    validateDBInstance(db)
    logger.debug(
      'userController.js => updateUsersController() => Conexión a DB validada'
    )

    // Normalizar entrada a formato estándar: { attributes, checkBy }
    const formattedUsers = rawUsers.map((entry, index) => {
      if (Array.isArray(entry)) {
        // Formato [[{attributes}, {checkBy}]]
        if (
          entry.length !== 2 ||
          typeof entry[0] !== 'object' ||
          typeof entry[1] !== 'object'
        ) {
          logger.error(
            `userController.js => updateUsersController() => Formato inválido en el usuario en la posición ${index}`
          )
          throwError(
            CODES.INVALID_UPDATE_FORMAT.CODE,
            CODES.INVALID_UPDATE_FORMAT.MESSAGE
          )
        }

        return {
          attributes: entry[0],
          checkBy: entry[1],
        }
      } else if ('attributes' in entry && 'checkBy' in entry) {
        // Formato estándar
        return {
          attributes: entry.attributes,
          checkBy: entry.checkBy,
        }
      } else if ('id' in entry) {
        // Formato simple con ID
        const { id, ...rest } = entry
        if (Object.keys(rest).length === 0) {
          logger.error(
            `userController.js => updateUsersController() => No se proporcionaron atributos para actualizar en el usuario con id ${id}`
          )
          throwError(
            CODES.INVALID_UPDATE_FORMAT.CODE,
            CODES.INVALID_UPDATE_FORMAT.MESSAGE
          )
        }

        return {
          checkBy: { id },
          attributes: rest,
        }
      } else {
        logger.error(
          `userController.js => updateUsersController() => Formato de usuario no reconocido en la posición ${index}`
        )
        throwError(
          CODES.INVALID_UPDATE_FORMAT.CODE,
          CODES.INVALID_UPDATE_FORMAT.MESSAGE
        )
      }
    })

    logger.debug(
      {
        cantidad: formattedUsers.length,
        preview: formattedUsers.slice(0, 3),
      },
      'userController.js => updateUsersController() => Usuarios normalizados para actualización'
    )

    const updatedUsers = await updateUsersBulk(db, formattedUsers)

    if (updatedUsers.length === 0) {
      logger.info(
        'userController.js => updateUsersController() => No se actualizaron usuarios'
      )
    } else {
      logger.info(
        { cantidad: updatedUsers.length },
        'userController.js => updateUsersController() => Usuarios actualizados correctamente'
      )
    }

    sendResponse(res, { updatedUsers }, 'Usuarios actualizados')
  } catch (err) {
    logger.error(
      { err },
      'userController.js => updateUsersController() => Error al actualizar los usuarios'
    )
    next(err)
  }
}

/**
 * PATCH /api/users/:id
 * Actualiza un solo usuario por su ID.
 */
export async function updateSingleUserController(req, res, next) {
  const logger = req.logger || globalLogger
  const db = req.db || null
  const id = req.params.id

  logger.debug(
    { id, body: req.body },
    'userController.js => updateSingleUserController() => Solicitud recibida para actualizar un usuario por su id'
  )

  try {
    validateDBInstance(db)
    logger.debug(
      'userController.js => updateSingleUserController() => Conexión a DB validada'
    )

    if (!id) {
      throwError(400, 'Debe proporcionarse un ID de usuario en la URL')
    }

    const attributes = req.body || {}
    if (
      typeof attributes !== 'object' ||
      Array.isArray(attributes) ||
      Object.keys(attributes).length === 0
    ) {
      throwError(
        CODES.INVALID_UPDATE_FORMAT.CODE,
        CODES.INVALID_UPDATE_FORMAT.MESSAGE
      )
    }

    // // Eliminar el id si viene en los atributos
    // if ('id' in attributes) {
    //   delete attributes.id
    //   logger.debug(
    //     'userController.js => updateSingleUserController() => Se eliminó el campo "id" de los atributos'
    //   )
    // }

    // Armar checkBy con el id de la URL
    const checkBy = { id }

    // Usar el servicio específico para actualizar un usuario
    const updatedUsers = await updateUser(db, attributes, checkBy)

    if (!updatedUsers.length) {
      logger.info(
        { id },
        'userController.js => updateSingleUserController() => Usuario no encontrado o no actualizado'
      )
      throwError(
        CODES.USER_NOT_FOUND.CODE,
        `No se encontró el usuario con ID ${id}`
      )
    }

    logger.info(
      { id },
      'userController.js => updateSingleUserController() => Usuario actualizado correctamente'
    )

    sendResponse(res, { user: updatedUsers[0] }, 'Usuario actualizado')
  } catch (err) {
    logger.error(
      { err },
      'userController.js => updateSingleUserController() => Error al actualizar el usuario'
    )
    next(err)
  }
}
