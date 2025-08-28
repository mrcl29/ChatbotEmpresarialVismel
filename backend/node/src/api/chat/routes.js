// backend/node/src/api/chat/routes.js
import { Router } from 'express'
import ENV from '../../config/env.js'
import { authenticateRequest, authorizeRoles } from '../../middleware/index.js'
import { talk, getHistory, deleteHistory } from '../../controllers/chatController.js'

const chatRoutes = Router()

// Aplicar autenticación y autorización a todas las rutas
chatRoutes.use(authenticateRequest, authorizeRoles('admin', 'developer'))

/**
 * POST /api/chat/talk
 * API para enviar un mensaje al bot y recibir una respuesta
 */
chatRoutes.post(ENV.API.TALK, talk)

/**
 * GET /api/chat/talk
 * Obtener el historial del chat de un usuario.
 */
chatRoutes.get(ENV.API.TALK, getHistory)

/**
 * DELETE /api/chat/talk
 * Eliminar el historial del chat de un usuario.
 */
chatRoutes.delete(ENV.API.TALK, deleteHistory)

export default chatRoutes
