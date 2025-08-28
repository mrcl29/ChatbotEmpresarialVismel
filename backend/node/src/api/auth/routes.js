// backend/node/src/api/auth/routes.js

import { Router } from 'express'
import ENV from '../../config/env.js'
import { login, register } from '../../controllers/authController.js'

const authRoutes = Router()

/**
 * POST /api/auth/login
 * API para login con username y password
 */
authRoutes.post(ENV.API.LOGIN, login)
/**
 * POST /api/auth/register
 * API para registrar un usuario
 */
authRoutes.post(ENV.API.REGISTER, register)

export default authRoutes
