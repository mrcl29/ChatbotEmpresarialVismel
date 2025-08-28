// backend/node/src/middleware/errorHandler.js
import { sendResponse } from '../utils/generalFunctions.js'
import globalLogger from '../logging/globalLogger.js'
import ENV from '../config/env.js'

/**
 * Middleware de manejo global de errores.
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  const status =
    typeof err.status === 'number' && err.status >= 400 && err.status < 600
      ? err.status
      : 500

  const message =
    typeof err.message === 'string' && err.message.length > 0
      ? err.message
      : 'Error interno del servidor'

  const logger = req.logger || globalLogger

  logger.error(
    { err },
    'errorHandler.js => Error capturado en middleware global.'
  )

  const errorPayload = {
    error: err.name || 'Error',
  }

  // Solo incluir la traza si no está en producción
  if (ENV.NODE_ENV !== 'production') {
    errorPayload.stack = err.stack
  }

  sendResponse(res, errorPayload, message, status)
}

export default errorHandler
