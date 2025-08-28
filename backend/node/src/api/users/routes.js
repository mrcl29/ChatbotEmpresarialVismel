// backend/node/src/api/users/routes.js
import { Router } from 'express'
import ENV from '../../config/env.js'
import { authenticateRequest, authorizeRoles } from '../../middleware/index.js'
import {
  getAllUsersController,
  getAllRolesController,
  updateUsersController,
  updateSingleUserController,
} from '../../controllers/userController.js'

const usersRoutes = Router()

// Aplicar autenticación y autorización a todas las rutas
usersRoutes.use(authenticateRequest, authorizeRoles('admin', 'developer'))

/**
 * GET /api/users
 * Obtener todos los usuarios.
 */
usersRoutes.get(ENV.API.USERS, getAllUsersController)

/**
 * GET /api/users/roles
 * Obtener todos los roles disponibles.
 */
usersRoutes.get(ENV.API.ROLES, getAllRolesController)

/**
 * PATCH /api/users
 * Actualizar uno o varios usuarios.
 */
usersRoutes.patch(ENV.API.USERS, updateUsersController)

/**
 * PATCH /api/users/:id
 * Actualizar un solo usuario por su ID.
 */
usersRoutes.patch(`${ENV.API.USERS}:id`, updateSingleUserController)

export default usersRoutes
