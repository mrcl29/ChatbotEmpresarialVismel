// backend/node/src/db/pool.js
import { Pool } from 'pg'
import ENV from '../config/env.js'
import globalLogger from '../logging/globalLogger.js'

let pool = createNewPool()

const RETRY_DELAY_MS = 3000 // 3 segundos
const HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos

function createNewPool() {
  return new Pool({
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    user: ENV.DB.USER,
    password: ENV.DB.PASSWORD,
    database: ENV.DB.NAME,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function tryConnect() {
  let attempt = 1
  while (true) {
    try {
      const client = await pool.connect()
      globalLogger.info(
        `pool.js => ✅ Conectado a la DB ${ENV.DB.HOST}:${ENV.DB.PORT} (intento ${attempt})`
      )
      client.release()
      break
    } catch (err) {
      globalLogger.error(
        `pool.js => ❌ Fallo de conexión a la DB ${ENV.DB.HOST}:${ENV.DB.PORT} (intento ${attempt}): ${err.message}`
      )
      attempt++
      await wait(RETRY_DELAY_MS)
    }
  }
}

// Inicialización: intentar conectar una vez
await tryConnect()

// Estado interno para evitar múltiples reconexiones simultáneas
let isReconnecting = false

const healthCheck = async () => {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    globalLogger.info('pool.js => ✅ Verificación de conexión exitosa')
    client.release()
  } catch (err) {
    globalLogger.error(
      `pool.js => ❌ Verificación de conexión fallida: ${err.message}`
    )

    if (!isReconnecting) {
      isReconnecting = true
      globalLogger.warn('pool.js => 🔄 Iniciando reconexión automática...')

      while (true) {
        try {
          // Cerrar el pool actual antes de intentar uno nuevo
          await pool.end().catch(() => {}) // prevenir errores si ya está cerrado
          pool = createNewPool()

          const client = await pool.connect()
          await client.query('SELECT 1')
          client.release()

          globalLogger.info('pool.js => ✅ Reconexión exitosa')
          isReconnecting = false
          break
        } catch (reconnectErr) {
          globalLogger.error(
            `pool.js => ❌ Fallo en reconexión: ${reconnectErr.message}`
          )
          await wait(RETRY_DELAY_MS)
        }
      }
    }
  }
}

// Ejecutar verificación de salud periódica
setInterval(healthCheck, HEALTH_CHECK_INTERVAL_MS)

export default pool
