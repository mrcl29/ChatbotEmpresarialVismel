// backend/node/src/services/userService.js

/**
 * Obtiene todos los usuarios de la base de datos con sus atributos principales.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @returns {Promise<Array>} - Lista de objetos de usuarios con id, nombre, username y rol.
 */
export async function getAllUsers(db) {
  return await db.getUsersByAttributes(['id', 'nombre', 'username', 'rol'])
}

/**
 * Obtiene todos los roles de la base de datos con sus atributos principales.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @returns {Promise<Array>} - Lista de objetos de roles con id y rol.
 */
export async function getAllRoles(db) {
  return await db.getRolesByAttributes(['id', 'rol'])
}

/**
 * Actualiza un usuario. Usa el ID si está disponible; de lo contrario, intenta encontrarlo usando los criterios.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @param {Object} attributes - Atributos a actualizar.
 * @param {Object} checkBy - Criterios para encontrar al usuario (idealmente incluye 'id').
 * @returns {Promise<Array>} - Usuario(s) actualizado(s).
 */
export async function updateUser(db, attributes, checkBy = {}) {
  let actualCheckBy = { ...checkBy }

  // Si no se incluye el ID, intentar buscarlo primero
  if (!('id' in actualCheckBy)) {
    const possibleUsers = await db.getUsersByAttributes(['id'], checkBy)

    if (!possibleUsers.length) {
      throw new Error('Usuario no encontrado con los criterios dados.')
    }

    if (possibleUsers.length > 1) {
      throw new Error(
        'Múltiples usuarios encontrados, se requiere un identificador más preciso.'
      )
    }

    actualCheckBy = { id: possibleUsers[0].id }
  }

  return await db.updateCommonUsers(attributes, actualCheckBy)
}

/**
 * Actualiza múltiples usuarios. Cada entrada debe tener 'attributes' y 'checkBy'.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @param {Array<Object>} updates - Lista de actualizaciones: [{ attributes, checkBy }]
 * @returns {Promise<Array>} - Usuarios actualizados.
 */
export async function updateUsersBulk(db, updates = []) {
  if (!Array.isArray(updates) || !updates.length) {
    throw new Error('Se esperaba un array de actualizaciones.')
  }

  const results = []

  try {
    for (const update of updates) {
      const { attributes, checkBy } = update
      const updated = await db.updateCommonUsers(attributes, checkBy)
      results.push(...updated)
    }
    return results
  } catch (err) {
    throw err
  }
}
