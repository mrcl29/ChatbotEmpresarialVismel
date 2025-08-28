// backend/node/src/controllers/chatController.js
import globalLogger from '../logging/globalLogger.js'
import globalRedisClient from '../db/globalRedisClient.js'
import ENV from '../config/env.js'
import { talkToBot } from '../services/chatService.js'
import {
  getChatHistory,
  deleteChatHistory,
} from '../services/historyService.js'
import { CODES } from '../constants/codes.js'
import { throwError, sendResponse } from '../utils/generalFunctions.js'
import { validateUserMessage } from '../utils/validators.js'

/**
 * POST /api/chat/talk
 * API para enviar un mensaje al bot y recibir una respuesta
 */
export async function talk(req, res, next) {
  const logger = req.logger || globalLogger

  logger.debug(
    { body: req.body },
    'chatController.js => talk() => Solicitud recibida'
  )

  try {
    const message = req.body?.message
    const sessionId = req?.user?.sessionID || req.body?.sessionID
    const userId = req?.user?.id || req.body?.id
    const rd = req?.redis || globalRedisClient

    // Validación de parámetros
    if (!sessionId) {
      logger.warn(
        'chatController.js => talk() => Falta el sessionID del usuario'
      )
      return throwError(CODES.MISSING_TOKEN.CODE, CODES.MISSING_TOKEN.MESSAGE)
    }
    if (!userId) {
      logger.warn('chatController.js => talk() => Falta el id del usuario')
      return throwError(CODES.MISSING_TOKEN.CODE, CODES.MISSING_TOKEN.MESSAGE)
    }

    validateUserMessage(message)

    logger.info(
      { sessionId },
      'chatController.js => talk() => Parámetros validados correctamente'
    )

    // Comunicación con el bot
    const response = await talkToBot(message, sessionId, rd, userId)

    logger.debug(
      { response },
      'chatController.js => talk() => Respuesta del bot obtenida'
    )

    // Validación de respuesta del bot
    if (!response || typeof response !== 'string') {
      logger.error(
        { response },
        'chatController.js => talk() => Respuesta del bot inválida'
      )
      return throwError(
        CODES.BOT_RESPONSE_INVALID.CODE,
        CODES.BOT_RESPONSE_INVALID.MESSAGE
      )
    }

    if (response.length > ENV.LIMIT.MAX_CHAR_BOT_MESSAGE) {
      response =
        response.substring(0, ENV.LIMIT.MAX_CHAR_BOT_MESSAGE - 3) + '...'
      logger.warn(
        'chatController.js => talk() => La respuesta del bot se ha cortado porque era demasiado larga'
      )
    }

    logger.info('chatController.js => talk() => Respuesta enviada exitosamente')
    sendResponse(res, { response })
  } catch (err) {
    logger.error(
      { err },
      'chatController.js => talk() => Error al comunicarse con el bot'
    )
    next(err)
  }
}

/**
 * GET /api/chat/talk
 * Obtener el historial del chat de un usuario.
 */
export async function getHistory(req, res, next) {
  const logger = req.logger || globalLogger

  logger.debug(
    { body: req.body },
    'chatController.js => getHistory() => Solicitud recibida'
  )

  try {
    const limit = req?.body?.limit || -1
    const userId = req?.user?.id || req.body?.id
    const rd = req?.redis || globalRedisClient

    if (!userId) {
      logger.warn(
        'chatController.js => getHistory() => Falta el id del usuario'
      )
      return throwError(CODES.MISSING_TOKEN.CODE, CODES.MISSING_TOKEN.MESSAGE)
    }

    logger.info(
      { userId },
      'chatController.js => getHistory() => Parámetros validados correctamente'
    )

    const response = await getChatHistory(rd, userId, limit)

    if (!response) {
      throwError(CODES.ERROR_GET_HISTORY.CODE, CODES.ERROR_GET_HISTORY.MESSAGE)
    }

    logger.info(
      `chatController.js => getHistory() => Historial obtenido correctamente ${JSON.stringify(response)}`
    )
    sendResponse(res, { response }, 'Historial obtenido correctamente')
  } catch (err) {
    logger.error(
      { err },
      'chatController.js => getHistory() => Error al obtener el historial'
    )
    next(err)
  }
}

/**
 * DELETE /api/chat/talk
 * Eliminar el historial del chat de un usuario.
 */
export async function deleteHistory(req, res, next) {
  const logger = req.logger || globalLogger

  logger.debug(
    { body: req.body },
    'chatController.js => deleteHistory() => Solicitud recibida'
  )

  try {
    const userId = req?.user?.id || req.body?.id
    const rd = req?.redis || globalRedisClient

    if (!userId) {
      logger.warn(
        'chatController.js => deleteHistory() => Falta el id del usuario'
      )
      return throwError(CODES.MISSING_TOKEN.CODE, CODES.MISSING_TOKEN.MESSAGE)
    }

    logger.info(
      { userId },
      'chatController.js => deleteHistory() => Parámetros validados correctamente'
    )

    const response = await deleteChatHistory(rd, userId)

    if (!response) {
      throwError(
        CODES.ERROR_DELETE_HISTORY.CODE,
        CODES.ERROR_DELETE_HISTORY.MESSAGE
      )
    }

    logger.info(
      'chatController.js => deleteHistory() => Historial eliminado correctamente'
    )
    sendResponse(res, { response }, 'Historial eliminado correctamente')
  } catch (err) {
    logger.error(
      { err },
      'chatController.js => deleteHistory() => Error al eliminar el historial'
    )
    next(err)
  }
}
