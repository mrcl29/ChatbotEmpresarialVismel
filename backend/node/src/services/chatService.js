// backend/node/src/services/chatService.js
import globalLogger from '../logging/globalLogger.js'
import ENV from '../config/env.js'
import globalRedisClient from '../db/globalRedisClient.js'
import { getChatHistory, saveChat } from './historyService.js'

/**
 * Envía un texto a la API del bot y devuelve la respuesta recibida.
 *
 * @param {string} message - Mensaje que se enviará al bot
 * @param {string} sessionID - ID de la sesión actual
 * @returns {Promise<string>} - Respuesta del bot
 * @throws {Error} - Si la API responde con error
 */
export async function talkToBot(
  message,
  sessionID,
  rd = globalRedisClient,
  userId = -1
) {
  const url = `http://${ENV.BOT_HOST}:${ENV.BOT_PORT}/agent/`
  globalLogger.debug(`chatService.js - talkToBot() - Hablando con el bot...`)
  globalLogger.debug(`chatService.js - talkToBot() - userID: ${userId}`)
  let history = {}
  if (userId > -1) {
    history = await getChatHistory(rd, userId, 10)
    globalLogger.debug(
      `chatService.js - talkToBot() - Historial obtenido: ${JSON.stringify(history)}`
    )
    if (!history) history = {}
  }

  const response = await fetch(url + 'talk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionID,
      'X-Internal-API-Key': ENV.INTERNAL_API_KEY,
    },
    body: JSON.stringify({ message, history }),
  })

  const result = await response.json()

  if (!response.ok || result.status !== 'success') {
    const errorMessage = result?.errors || 'Error desconocido del bot'
    throw new Error(errorMessage)
  }

  globalLogger.debug(
    `chatService.js - talkToBot() - Respuesta obtenida correctamente`
  )

  if (userId > -1) {
    await saveChat(rd, userId, message, result.data)
    globalLogger.debug(`chatService.js - talkToBot() - Chat guardado`)
  }

  return result.data
}
