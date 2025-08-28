import { Router } from 'express'
import ENV from '../../config/env.js'
import { sendResponse, throwError } from '../../utils/generalFunctions.js'
import { CODES } from '../../constants/codes.js'

const exampleRoutes = Router()

/**
 * GET /api/example
 * Ruta de ejemplo que responde con OK.
 */
exampleRoutes.get(ENV.API.EXAMPLE, (req, res, next) => {
  const logger = req.logger

  logger?.debug(`exampleRoutes => Recibida petición GET ${ENV.API.EXAMPLE}`)
  logger?.info(`exampleRoutes => Procesando petición en ${ENV.API.EXAMPLE}`)

  try {
    logger?.debug('exampleRoutes => Preparando respuesta OK')
    sendResponse(res, null, 'OK')

    logger?.info('exampleRoutes => Respuesta enviada correctamente')
  } catch (err) {
    logger?.error(
      { err },
      `exampleRoutes => Error al procesar ${ENV.API.EXAMPLE}`
    )
    return next(
      throwError(CODES.INTERNAL_ERROR.CODE, CODES.INTERNAL_ERROR.MESSAGE)
    )
  }
})

export default exampleRoutes
