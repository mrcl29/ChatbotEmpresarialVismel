// backend/node/src/middleware/authorizeRoles.js
import { throwError } from '../utils/generalFunctions.js'
import { CODES } from '../constants/codes.js'

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.rol
    if (!allowedRoles.includes(userRole)) {
      return next(throwError(CODES.FORBIDDEN.CODE, CODES.FORBIDDEN.MESSAGE))
    }
    next()
  }
}

export default authorizeRoles
