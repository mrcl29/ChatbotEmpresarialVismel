// backend/node/src/middleware/attachRequestLogger.js
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import globalLogger from '../logging/globalLogger.js'
import ENV from '../config/env.js'

/**
 * Middleware que adjunta un logger contextualizado a cada request.
 * Si el token JWT es válido, asocia usuario y sessionID; si no, lo marca como anónimo.
 */
const attachRequestLogger = (req, res, next) => {
  globalLogger.debug('attachRequestLogger => Iniciando middleware...')

  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET)

      req.logger = globalLogger.child({
        user: decoded?.user || 'anonymous',
        sessionID: decoded?.sessionID || null,
        requestId: uuidv4(),
      })

      req.user = decoded?.user

      req.logger.info(
        {
          user: decoded?.user,
          sessionID: decoded?.sessionID,
        },
        'attachRequestLogger => Token válido, logger adjuntado con contexto de usuario.'
      )
    } catch (err) {
      globalLogger.warn(
        { err },
        'attachRequestLogger => Token inválido. Se generará logger anónimo.'
      )

      req.logger = globalLogger.child({
        anonymous: true,
        requestId: uuidv4(),
      })
    }
  } else {
    globalLogger.debug(
      'attachRequestLogger => No se encontró token. Logger anónimo.'
    )

    req.logger = globalLogger.child({
      anonymous: true,
      requestId: uuidv4(),
    })
  }

  next()
}

export default attachRequestLogger
