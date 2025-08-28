// backend/node/src/logging/globalLogger.js
import pino from 'pino'
import ENV from '../config/env.js'

const globalLogger = pino({
  level: ENV.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    ENV.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: true },
        }
      : undefined,
})

export default globalLogger
