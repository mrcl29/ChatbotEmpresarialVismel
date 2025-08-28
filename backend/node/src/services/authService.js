// backend/node/src/services/authService.js

/**
 * Verifica si existe un usuario en la base de datos con el username proporcionado.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @param {string} username - Nombre de usuario a buscar.
 * @returns {Promise<boolean>} - Devuelve true si existe, false en caso contrario.
 */
export async function checkUserExists(db, username) {
  return (await db.getUsersByAttributes(['id'], { username })).length > 0
}

/**
 * Busca y devuelve los datos completos de un usuario usando su username.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @param {string} username - Nombre de usuario a buscar.
 * @returns {Promise<Array>} - Lista de usuarios encontrados (debería tener máximo 1).
 */
export async function findUserByUsername(db, username) {
  const users = await db.getUsersByAttributes(
    ['id', 'nombre', 'username', 'password', 'rol'],
    { username: username }
  )
  return users
}

/**
 * Crea un nuevo usuario en la base de datos con los datos proporcionados.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña ya hasheada.
 * @param {string} rol - Rol del usuario.
 * @param {string} name - Nombre completo o visible del usuario.
 * @returns {Promise<Object>} - Objeto con los datos del nuevo usuario creado.
 */
export async function createNewUser(db, username, password, rol, name) {
  const createdUsers = await db.createUser({
    username: username,
    password: password,
    rol: rol,
    nombre: name,
  })
  if (!createdUsers || !createdUsers.length) {
    return {}
  }
  return createdUsers[0]
}
