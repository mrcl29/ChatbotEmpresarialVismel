// backend/node/src/middleware/notFoundHandler.js
import { sendResponse } from '../utils/generalFunctions.js'
import globalLogger from '../logging/globalLogger.js'
import { CODES } from '../constants/codes.js'

/**
 * Middleware para manejar rutas no encontradas (404).
 */
const notFoundHandler = (req, res, next) => {
  const logger = req.logger || globalLogger

  logger.warn(
    {
      path: req.originalUrl,
      method: req.method,
    },
    'notFoundHandler => Ruta no encontrada'
  )

  sendResponse(
    res,
    {
      error: CODES.ROUTE_NOT_FOUND.MESSAGE,
      path: req.originalUrl,
      method: req.method,
    },
    CODES.ROUTE_NOT_FOUND.MESSAGE,
    CODES.ROUTE_NOT_FOUND.CODE
  )
}

export default notFoundHandler
