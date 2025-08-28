// backend/node/src/controllers/dashboardController.js
import { getDashboardInfo } from '../services/dashboardInfoService.js'
import { CODES } from '../constants/codes.js'
import { throwError, sendResponse } from '../utils/generalFunctions.js'
import { validateDBInstance } from '../utils/validators.js'

/**
 * GET /api/dashboard/:info
 * Obtener una info concreta para el dashboard.
 */
export async function getDashboardInfoController(req, res, next) {
  const logger = req.logger || globalLogger
  const db = req.db || null
  const info = req.params.info

  logger.debug(
    { body: req.body },
    'dashboardController.js => getDashboardInfoController() => Solicitud para obtener la info para el dashboard'
  )

  try {
    validateDBInstance(db)
    if (!info || !typeof info === "string") {
        throwError(
        CODES.PARAM_ERROR.CODE,
        CODES.PARAM_ERROR.MESSAGE
      )
    }
    logger.debug(
      'dashboardController.js => getDashboardInfoController() => Todos los parámetros han sido validados'
    )

    const results = await getDashboardInfo(db, info)
    logger.debug(
      { results: results.length },
      'dashboardController.js => getDashboardInfoController() => Info obtenida de la base de datos'
    )

    sendResponse(res, { results })
  } catch (err) {
    logger.error(
      { err },
      'dashboardController.js => getDashboardInfoController() => Error obteniendo la info del dashboard'
    )
    next(err)
  }
}