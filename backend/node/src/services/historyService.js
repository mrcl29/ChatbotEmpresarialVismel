// backend/node/src/services/chatHistory.js
import globalLogger from '../logging/globalLogger.js'
import globalRedisClient from '../db/globalRedisClient.js'

/**
 * Guarda un chat entre usuario y bot en Redis durante 1 mes.
 *
 * @param {Object} rd - Instancia de conexión a la base de datos.
 * @param {int} userId - Id del usuario que servirá como clave única.
 * @param {String} userMessage - Mensaje del usuario.
 * @param {String} botMessage - Mensaje del bot.
 * @returns {Boolean}
 */
export async function saveChat(
  rd = globalRedisClient,
  userId,
  userMessage,
  botMessage
) {
  const key = `chat:${userId}`
  const chatEntry = {
    // timestamp: new Date().toISOString(),
    user: userMessage,
    bot: botMessage,
  }
  const ex = 30 * 24 * 60 * 60 // 1 mes = 30 días = 30 * 24 * 60 * 60 = 2,592,000 segundos
  return await rd.lpushToList(key, JSON.stringify(chatEntry), ex)
}

/**
 * Recupera los últimos chats de un usuario con el bot.
 *
 * @param {Object} rd - Instancia de conexión a la base de datos.
 * @param {int} userId - Id del usuario que servirá como clave única.
 * @param {int} limit - Número de chats a recuperar.
 * @returns {Array}
 */
export async function getChatHistory(
  rd = globalRedisClient,
  userId,
  limit = -1
) {
  globalLogger.debug(`chatHistory.js - talkToBot() - Obteniendo historial...`)
  const key = `chat:${userId}`
  return await rd.getListRange(key, limit)
}

/**
 * Reemplaza todo el historial de chat de un usuario
 * por un único entry con la key `history_resume`.
 *
 * @param {Object} rd - Instancia de conexión a la base de datos.
 * @param {int} userId - Id del usuario que servirá como clave única.
 * @param {String} resumeText - Texto resumen del historial.
 * @returns {Object}
 */
export async function replaceChatHistory(
  rd = globalRedisClient,
  userId,
  resumeText
) {
  const key = `chat:${userId}`
  const ex = 30 * 24 * 60 * 60

  try {
    await rd.delete(key)

    const chatEntry = {
      // timestamp: new Date().toISOString(),
      history_resume: resumeText,
    }

    await rd.lpushToList(key, JSON.stringify(chatEntry), ex)

    globalLogger.info(
      `chatHistory.js - Reemplazado historial de ${userId} por history_resume`
    )
    return [chatEntry]
  } catch (err) {
    globalLogger.error(`chatHistory.js - Error al reemplazar historial: ${err}`)
    return []
  }
}

/**
 * Elimina todo el historial del chat.
 *
 * @param {Object} rd - Instancia de conexión a la base de datos.
 * @param {int} userId - Id del usuario que servirá como clave única.
 * @returns {Boolean}
 */
export async function deleteChatHistory(rd = globalRedisClient, userId) {
  const key = `chat:${userId}`

  try {
    await rd.delete(key)

    globalLogger.info(
      `chatHistory.js - Eliminado el historial del usuario ${userId}`
    )
    return true
  } catch (err) {
    globalLogger.error(`chatHistory.js - Error al eliminar historial: ${err}`)
    return false
  }
}
