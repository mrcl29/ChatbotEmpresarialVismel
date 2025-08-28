// backend/node/src/db/globalRedisClient.js
import RedisClient from './redisClient.js'
import ENV from '../config/env.js'
import globalLogger from '../logging/globalLogger.js'

const RETRY_DELAY_MS = 3000 // 3 segundos
const HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos

let globalRedisClient = createNewClient()

function createNewClient() {
  return new RedisClient(
    ENV.REDIS.HOST,
    ENV.REDIS.PORT,
    ENV.REDIS.PASSWORD,
    globalLogger
  )
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Estado interno para evitar múltiples reconexiones simultáneas
let isReconnecting = false

async function tryConnect() {
  let attempt = 1
  while (true) {
    try {
      await globalRedisClient.connect()
      const pong = await globalRedisClient.ping()
      if (!pong) throw new Error('Sin Ping')
      globalLogger.info(
        `globalRedisClient.js => ✅ Conectado a Redis ${ENV.REDIS.HOST}:${ENV.REDIS.PORT} (intento ${attempt})`
      )
      break
    } catch (err) {
      globalLogger.error(
        `globalRedisClient.js => ❌ Fallo de conexión a Redis ${ENV.REDIS.HOST}:${ENV.REDIS.PORT} (intento ${attempt}): ${err.message}`
      )
      attempt++
      await wait(RETRY_DELAY_MS)
    }
  }
}

// Health check periódico
const healthCheck = async () => {
  try {
    if (await globalRedisClient.ping()) {
      globalLogger.info(
        'globalRedisClient.js => ✅ Verificación de conexión exitosa (PING)'
      )
    } else {
      throw new Error(`Sin Ping...`)
    }
  } catch (err) {
    globalLogger.error(
      `globalRedisClient.js => ❌ Verificación de conexión fallida: ${err.message}`
    )

    if (!isReconnecting) {
      isReconnecting = true
      globalLogger.warn(
        'globalRedisClient.js => 🔄 Iniciando reconexión automática...'
      )

      while (true) {
        try {
          // Cerrar cliente actual antes de intentar uno nuevo
          try {
            await globalRedisClient.disconnect()
          } catch {}

          globalRedisClient = createNewClient()

          const pong = await globalRedisClient.ping()
          if (pong) {
            globalLogger.info('globalRedisClient.js => ✅ Reconexión exitosa')
            isReconnecting = false
            break
          }
        } catch (reconnectErr) {
          globalLogger.error(
            `globalRedisClient.js => ❌ Fallo en reconexión: ${reconnectErr.message}`
          )
          await wait(RETRY_DELAY_MS)
        }
      }
    }
  }
}

async function init() {
  // Inicialización
  await tryConnect()
  setInterval(healthCheck, HEALTH_CHECK_INTERVAL_MS)
}

init()

export default globalRedisClient
