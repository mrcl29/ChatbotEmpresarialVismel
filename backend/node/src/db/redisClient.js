// backend/node/src/db/redisClient.js
import { createClient } from 'redis'
import globabalLogger from '../logging/globalLogger.js'

/**
 * Objeto que representa una conexion a una DB de Redis.
 */
export default class RedisClient {
  /**
   * @param {string} host
   * @param {number} port
   * @param {string} password
   * @param {object} logger - logger con métodos info, error
   */
  constructor(host, port, password, logger = globabalLogger) {
    this.host = host
    this.port = port
    this.password = password
    this.logger = logger

    this.client = null
    this.createRedisClient()
  }

  async createRedisClient() {
    if (!this.client) {
      this.client = createClient({
        socket: { host: this.host, port: this.port },
        password: this.password,
        legacyMode: true,
      })
    }
  }

  async connect() {
    if (!this.client) await this.createRedisClient()
    if (!this.client.isOpen) {
      try {
        await this.client.connect()
        // Ahora asignamos el listener para errores operativos
        this.client.on('error', (err) => {
          this.logger.debug(`Redis operational error: ${err.message}`)
          this.client = null
        })
      } catch (e) {
        this.client = null
        throw e // <-- Esto permitirá que tryConnect() capture el error
      }
    }
  }

  async disconnect() {
    if (this.client && this.client.isOpen) {
      await this.client.disconnect()
    }
  }

  async ping() {
    try {
      await this.connect()
      if (!this.client || !this.client.isOpen) {
        throw new Error('Redis client no está disponible')
      }
      return (await this.client.ping()) === 'PONG'
    } catch (e) {
      this.logger.error(`redisClient - ping() - error: ${e}`)
      return false
    }
  }

  async set(key, value, ex = 0) {
    if (!this.client || !this.client.isOpen) {
      this.logger.error('redisClient - set() - cliente no disponible')
      return false
    }
    try {
      if (!this.client) return false
      if (ex > 0) {
        await this.client.set(key, value, { EX: ex })
      } else {
        await this.client.set(key, value)
      }
      return true
    } catch (e) {
      this.logger.error(`redisClient - set() - error: ${e}`)
      return false
    }
  }

  async get(key) {
    if (!this.client || !this.client.isOpen) {
      this.logger.error('redisClient - get() - cliente no disponible')
      return null
    }
    try {
      this.logger.debug(
        `redisClient - get() - Ejecutando get de la key: ${key}`
      )
      return await this.client.get(key)
    } catch (e) {
      this.logger.error(`redisClient - get() - error: ${e}`)
      return null
    }
  }

  async delete(key) {
    if (!this.client || !this.client.isOpen) {
      this.logger.error('redisClient - delete() - cliente no disponible')
      return 0
    }
    try {
      return await this.client.del(key)
    } catch (e) {
      this.logger.error(`redisClient - delete() - error: ${e}`)
      return 0
    }
  }

  async exists(key) {
    if (!this.client || !this.client.isOpen) {
      this.logger.error('redisClient - exists() - cliente no disponible')
      return false
    }
    try {
      const res = await this.client.exists(key)
      return res === 1
    } catch (e) {
      this.logger.error(`redisClient - exists() - error: ${e}`)
      return false
    }
  }

  async lpushToList(key, value) {
    if (!this.client || !this.client.isOpen) {
      this.logger.error('redisClient - lpushToList() - cliente no disponible')
      return false
    }
    try {
      await this.client.lPush(key, value)
      return true
    } catch (e) {
      this.logger.error(`redisClient - lpushToList() - error: ${e}`)
      return false
    }
  }

  async getListRange(key, limit = -1) {
    if (!this.client || !this.client.isOpen) {
      this.logger.error('redisClient - getListRange() - cliente no disponible')
      return false
    }
    try {
      this.logger.debug(
        `redisClient - getListRange() - Ejecutando getListRange de la key: ${key}`
      )

      // Si limit es null, undefined o 'none', obtener toda la lista
      const endIndex = limit == null || limit === 'none' ? -1 : limit - 1
      const items = await this.client.lRange(key, 0, endIndex)

      return items.map((item) => JSON.parse(item))
    } catch (e) {
      this.logger.error(`redisClient - getListRange() - error: ${e}`)
      return []
    }
  }
}
