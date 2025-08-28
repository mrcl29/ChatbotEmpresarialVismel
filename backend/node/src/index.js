// backend/node/src/index.js
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

// Configuración
import ENV from './config/env.js'

// Middlewares
import {
  attachRequestLogger,
  attachRequestDb,
  errorHandler,
  notFoundHandler,
} from './middleware/index.js'

// API
import exampleRoutes from './api/example/routes.js'
import authRoutes from './api/auth/routes.js'
import usersRoutes from './api/users/routes.js'
import chatRoutes from './api/chat/routes.js'
import dashboardRoutes from './api/dashboard/routes.js'

// Utils
import globalLogger from './logging/globalLogger.js'

const app = express()

// Middlewares base (parsers, CORS, rate limiting)
app.use(cookieParser()) // Middleware para parsear las cookies
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        `http://${ENV.FRONTEND_HOST}:${ENV.FRONTEND_PORT}`,
        `http://localhost:${ENV.FRONTEND_PORT}`,
      ]

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Session-Id',
      'X-Internal-API-Key',
    ],
    credentials: true,
  })
)
// Habilita CORS para permitir llamadas desde React

// Configuración rate limiting global
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // máximo 1000 solicitudes por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Por favor, inténtalo más tarde.',
  },
})

app.use(limiter)

app.use(express.json()) // Parseo de JSON en solicitudes

// Middlewares de contexto por request (logger, DB, etc.)
app.use(attachRequestLogger)
app.use(attachRequestDb)

// Rutas de la API
app.get('/', (req, res) =>
  res.send(`Backend activo en ${new Date().toISOString()}`)
)
app.use('/api/example', exampleRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Middlewares de error (404 y global)
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(ENV.PORT, () => {
  globalLogger.info(
    {
      host: ENV.HOST,
      port: ENV.PORT,
      environment: ENV.NODE_ENV,
    },
    `Servidor backend Node.js iniciado correctamente`
  )
})

// Prevención de errores silenciosos
process.on('unhandledRejection', (reason, promise) => {
  globalLogger.fatal('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (err) => {
  globalLogger.fatal('Uncaught Exception:', err)
  setTimeout(() => process.exit(1), 500)
})
