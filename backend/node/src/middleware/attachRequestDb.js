// backend/node/src/middleware/attachRequestDb.js
import Database from '../db/database.js'
import globalRedisClient from '../db/globalRedisClient.js'
import pool from '../db/pool.js'
import { throwError } from '../utils/generalFunctions.js'
import { CODES } from '../constants/codes.js'

/**
 * Middleware que adjunta una instancia de Database al request actual.
 */
const attachRequestDb = async (req, res, next) => {
  try {
    req.db = new Database(pool, req.logger)
    req.redis = globalRedisClient
    req.redis.logger = req.logger

    req.logger?.debug(
      {
        requestId: req.logger?.bindings()?.requestId,
      },
      'attachRequestDb => Se ha creado una nueva instancia de Database.'
    )

    const isConnected = await req.db.testConnection()

    if (!isConnected) {
      req.logger?.error(
        'attachRequestDb => Falló el test de conexión a la base de datos.'
      )
      throwError(
        CODES.DB_CONNECTION_FAILED.CODE,
        CODES.DB_CONNECTION_FAILED.MESSAGE
      )
    }

    req.logger?.info('attachRequestDb => Conexión a la base de datos OK.')

    next()
  } catch (error) {
    req.logger?.error(
      {
        error: error.message,
        stack: error.stack,
      },
      'attachRequestDb => Error al crear instancia de Database.'
    )
    next(error)
  }
}

export default attachRequestDb
