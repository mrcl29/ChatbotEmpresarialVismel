// backend/node/src/utils/generalFunctions.js

/**
 * Lanza un error personalizado con un código HTTP y mensaje definido.
 *
 * @param {number} status - Código de estado HTTP.
 * @param {string} message - Mensaje descriptivo del error.
 * @throws {Error} - Error con propiedades `status` y `message`.
 */
export const throwError = (status, message) => {
  const err = new Error(message)
  err.status = status
  throw err
}

/**
 * Envía una respuesta estándar en formato JSON al cliente.
 *
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Object} data - Datos adicionales a incluir en la respuesta.
 * @param {string} [message=''] - Mensaje opcional.
 * @param {number} [status=200] - Código de estado HTTP.
 */
export const sendResponse = (res, data = {}, message = '', status = 200) => {
  res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    ...data, // desestructura las claves y valores de data directamente en el objeto raíz
  })
}
