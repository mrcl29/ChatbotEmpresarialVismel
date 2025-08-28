// backend/node/src/utils/validators.js
import ENV from '../config/env.js'
import { throwError } from './generalFunctions.js'
import { CODES } from '../constants/codes.js'

/**
 * Valida que el nombre de usuario sea una cadena no vacía.
 *
 * @param {string} username - Nombre de usuario a validar.
 * @returns {string} - Nombre de usuario limpio (sin espacios).
 * @throws {Error} - Si el username no es válido.
 */
export function validateUsername(username) {
  if (typeof username !== 'string' || username.trim() === '') {
    throwError(CODES.USERNAME_REQUIRED.CODE, CODES.USERNAME_REQUIRED.MESSAGE)
  }
  return username.trim()
}

/**
 * Valida que la contraseña tenga la longitud mínima requerida.
 *
 * @param {string} password - Contraseña a validar.
 * @param {number} [minLength=6] - Longitud mínima permitida.
 * @returns {string} - Contraseña válida.
 * @throws {Error} - Si la contraseña no cumple con los requisitos.
 */
export function validatePassword(password, minLength = 6) {
  if (typeof password !== 'string' || password.length < minLength) {
    throwError(CODES.PASSWORD_TOO_SHORT.CODE, CODES.PASSWORD_TOO_SHORT.MESSAGE)
  }
  return password
}

/**
 * Verifica que la instancia de base de datos esté definida.
 *
 * @param {Object|null} db - Instancia de base de datos.
 * @throws {Error} - Si la instancia es nula o indefinida.
 */
export function validateDBInstance(db) {
  if (!db) {
    throwError(
      CODES.DB_INSTANCE_MISSING.CODE,
      CODES.DB_INSTANCE_MISSING.MESSAGE
    )
  }
}

/**
 * Valida que una entrada sea un array no vacío.
 *
 * @param {Array} entry - Array a validar.
 * @returns {Array} - Array.
 * @throws {Error} - Si el entry no es válido.
 */
export function validateArrayEntry(entry) {
  if (!entry || !Array.isArray(entry) || entry.length === 0) {
    throwError(
      CODES.INVALID_ARRAY_FORMAT.CODE,
      CODES.INVALID_ARRAY_FORMAT.MESSAGE
    )
  }
  return entry
}

/**
 * Valida el mensaje de un usuario.
 *
 * @param {string} message - Mensaje a validar.
 * @returns {Boolean}
 * @throws {Error} - Si el mensaje no es válido.
 */
export function validateUserMessage(message) {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return throwError(
      CODES.MESSAGE_REQUIRED.CODE,
      CODES.MESSAGE_REQUIRED.MESSAGE
    )
  }else if(message.length > ENV.LIMIT.MAX_CHAR_USER_MESSAGE){
    return throwError(
      CODES.LIMIT_CHARS.CODE,
      CODES.LIMIT_CHARS.MESSAGE
    )
  }
  return true
}
