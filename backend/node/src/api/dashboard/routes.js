// backend/node/src/api/dashboard/routes.js
import { Router } from 'express'
import ENV from '../../config/env.js'
import { authenticateRequest, authorizeRoles } from '../../middleware/index.js'
import { getDashboardInfoController } from '../../controllers/dashboardController.js'

const dashboardRoutes = Router()

// Aplicar autenticación y autorización a todas las rutas
dashboardRoutes.use(authenticateRequest, authorizeRoles('admin', 'developer'))

/**
 * GET /api/dashboard/:id
 * Obtener una info concreta para el dashboard.
 */
dashboardRoutes.get(`${ENV.API.DASHBOARD}:info`, getDashboardInfoController)

export default dashboardRoutes
