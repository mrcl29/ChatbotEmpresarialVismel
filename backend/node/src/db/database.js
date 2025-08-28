// backend/node/src/db/database.js
import globalLogger from '../logging/globalLogger.js'

const reservedWords = ['user', 'role', 'password', 'select', 'from', 'where']
const VISMEL = {
  USUARIO: ['id', 'nombre', 'username', 'password', 'rol_id'],
  ROL: ['id', 'rol'],
}

function wrapIfReserved(word) {
  return reservedWords.includes(word.toLowerCase()) ? `"${word}"` : word
}

/**
 * Objeto que representa una conexion a una DB.
 */
export default class Database {
  constructor(pool, logger = globalLogger) {
    this.pool = pool
    this.logger = logger
  }

  /**
   * Ejecuta una query dentro de la base de datos.
   * @param {String} q = "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)"
   * @param {List} params = [param1, param2, ...]
   * @returns {Promise<Array>}
   */
  async query(q, params = []) {
    const client = await this.pool.connect()

    // Timeout en milisegundos
    const timeoutMs = 5000

    // Promesa que ejecuta la query
    const queryPromise = client.query(q, params)

    // Promesa que falla si se supera el timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timed out')), timeoutMs)
    )

    try {
      // Espera a la que se resuelva primero: query o timeout
      const result = await Promise.race([queryPromise, timeoutPromise])

      const paramsToLog =
        JSON.stringify(params).length > 100
          ? JSON.stringify(params).slice(0, 100) + '...'
          : JSON.stringify(params)

      this.logger.debug(
        `database.js - query() => Ejecutada query: ${q} | params: ${paramsToLog}`
      )
      return result.rows
    } catch (err) {
      this.logger.error(
        `database.js - query() => Error ejecutando query: ${err.message}`
      )
      throw err
    } finally {
      client.release()
    }
  }

  /**
   * Testea la conexión a la base de datos ejecutando una consulta sencilla.
   * @returns {Boolean}
   */
  async testConnection() {
    try {
      await this.query('SELECT 1')
      this.logger.debug('database.js - testConnection() => Test exitoso')
      return true
    } catch (err) {
      this.logger.error(
        `database.js - testConnection() => Falló el test: ${err.message}`
      )
      return false
    }
  }

  /**
   * Obtiene la información indicada de los usuarios junto su rol según los
   * atributos indicados.
   * @param {List} attributes ["rol", "nombre", ...]
   * @param {Object} conditions {nombre: "Juan", username: "juan2924"}
   * @returns {Promise<Array>}
   */
  async getUsersByAttributes(attributes = ['*'], conditions = {}) {
    try {
      this.logger.debug(
        `database.js - getUsersByAttributes() => Parámetros recibidos: attributes=${attributes}, conditions=${JSON.stringify(conditions)}`
      )

      const validAttributes = attributes.filter(
        (attr) =>
          VISMEL.USUARIO.includes(attr) ||
          VISMEL.ROL.includes(attr) ||
          attr === '*'
      )

      if (!validAttributes.length) {
        this.logger.error(
          `database.js - getUsersByAttributes() => Atributos inválidos: ${attributes}`
        )
        return []
      }

      const validConditions = Object.keys(conditions).filter(
        (key) =>
          (VISMEL.USUARIO.includes(key) && key !== 'password') ||
          VISMEL.ROL.includes(key)
      )

      const queryConditions = validConditions.length
        ? 'WHERE ' +
          validConditions
            .map((key, index) => `${wrapIfReserved(key)} = $${index + 1}`)
            .join(' AND ')
        : ''

      const values = validConditions.map((key) => conditions[key])

      const columns = validAttributes.includes('*')
        ? '*'
        : validAttributes.map((attr) => wrapIfReserved(attr)).join(', ')

      const query = `SELECT ${columns} FROM vismel.full_usuario ${queryConditions};`

      this.logger.debug(
        `database.js - getUsersByAttributes() => Query: ${query} | valores: ${JSON.stringify(values)}`
      )

      const result = await this.query(query, values)

      this.logger.info(
        `database.js - getUsersByAttributes() => ${result.length} usuarios obtenidos`
      )

      return result
    } catch (err) {
      this.logger.error(
        `database.js - getUsersByAttributes() => Error: ${err.message}`
      )
      throw err
    }
  }

  /**
   * Obtiene la información indicada de los roles según los
   * atributos indicados.
   * @param {List} attributes ["rol", "id", ...]
   * @param {Object} conditions {rol: "admin"}
   * @returns {Promise<Array>}
   */
  async getRolesByAttributes(attributes = ['*'], conditions = {}) {
    try {
      this.logger.debug(
        `database.js - getRolesByAttributes() => Obteniendo información de usuarios con parámetros: ${attributes} y ${JSON.stringify(conditions)}`
      )

      const validAttributes = attributes.filter(
        (attr) => VISMEL.ROL.includes(attr) || attr === '*'
      )

      if (!validAttributes.length) {
        this.logger.error(
          `database.js - getRolesByAttributes() => Atributos inválidos: ${attributes}`
        )
        return []
      }

      const validConditions = Object.keys(conditions).filter((key) =>
        VISMEL.ROL.includes(key)
      )

      const queryConditions = validConditions.length
        ? 'WHERE ' +
          validConditions
            .map((key, index) => `${wrapIfReserved(key)} = $${index + 1}`)
            .join(' AND ')
        : ''

      const values = validConditions.map((key) => conditions[key])

      const columns = validAttributes.includes('*')
        ? '*'
        : validAttributes.map((attr) => wrapIfReserved(attr)).join(', ')

      const query = `SELECT ${columns} FROM vismel.rol ${queryConditions};`

      this.logger.debug(
        `database.js - getRolesByAttributes() => Query: ${query} | valores: ${JSON.stringify(values)}`
      )

      const result = await this.query(query, values)

      this.logger.info(
        `database.js - getRolesByAttributes() => ${result.length} roles obtenidos`
      )

      return result
    } catch (err) {
      this.logger.error(
        `database.js - getRolesByAttributes() => Error: ${err.message}`
      )
      throw err
    }
  }

  /**
   * Obtiene el total de máquinas de cada tipo.
   * @returns {Promise<Array>}
   */
  async getTotalMachineType() {
    try {
      this.logger.debug(
        `database.js - getTotalMachineType() => Obteniendo el total de las máquinas por tipo.`
      )

      const query = `SELECT 
                        COALESCE(tm.tipo, 'Sin Tipo') AS tipo, 
                        COUNT(*) AS total
                    FROM vismel.maquina m
                    LEFT JOIN vismel.tipo_maquina tm ON m.tipo_id = tm.id
                    GROUP BY COALESCE(tm.tipo, 'Sin Tipo')
                    ORDER BY total DESC;
                    `

      this.logger.debug(
        `database.js - getTotalMachineType() => Query: ${query}`
      )

      const result = await this.query(query)

      this.logger.info(
        `database.js - getTotalMachineType() => Total de tipos obtenidos correctamente.`
      )

      return result
    } catch (err) {
      this.logger.error(
        `database.js - getTotalMachineType() => Error: ${err.message}`
      )
      throw err
    }
  }

  /**
   * Obtiene el total de averias ordenadas por prioridad y estado.
   * @returns {Promise<Array>}
   */
  async getTotalMachineFault() {
    try {
      this.logger.debug(
        `database.js - getTotalMachineFault() => Obteniendo el total de averías por estado y prioridad.`
      )

      const query = `SELECT prioridad,
                          CASE 
                              WHEN completado = TRUE THEN 'Completadas'
                              ELSE 'Pendientes'
                          END AS estado,
                          COUNT(*) AS total
                    FROM vismel.averia
                    GROUP BY prioridad, estado
                    ORDER BY prioridad ASC, estado DESC;
                    `

      this.logger.debug(
        `database.js - getTotalMachineFault() => Query: ${query}`
      )

      const result = await this.query(query)

      this.logger.info(
        `database.js - getTotalMachineFault() => Total de averías obtenidas correctamente.`
      )

      return result
    } catch (err) {
      this.logger.error(
        `database.js - getTotalMachineFault() => Error: ${err.message}`
      )
      throw err
    }
  }

  /**
   * Obtiene las próximas revisiones.
   * @returns {Promise<Array>}
   */
  async getNextReviews() {
    try {
      this.logger.debug(
        `database.js - getNextReviews() => Obteniendo las próximas revisiones.`
      )

      const query = `SELECT rm.id AS id,
                          m.codigo AS codigo,
                          tm.tipo AS tipo,
                          rm.fecha_prevista,
                          u.nombre AS empleado
                    FROM vismel.revision_maquina rm
                    JOIN vismel.maquina m ON rm.maquina_id = m.id
                    JOIN vismel.tipo_maquina tm ON m.tipo_id = tm.id
                    JOIN vismel.usuario u ON rm.usuario_id = u.id
                    WHERE rm.fecha_prevista >= CURRENT_DATE
                    ORDER BY rm.fecha_prevista ASC;
                    `

      this.logger.debug(
        `database.js - getNextReviews() => Query: ${query}`
      )

      const result = await this.query(query)

      this.logger.info(
        `database.js - getNextReviews() => Revisiones obtenidas correctamente.`
      )

      return result
    } catch (err) {
      this.logger.error(
        `database.js - getNextReviews() => Error: ${err.message}`
      )
      throw err
    }
  }

  /**
   * Obtiene las ubicaciones de los clientes.
   * @returns {Promise<Array>}
   */
  async getClientLocations() {
    try {
      this.logger.debug(
        `database.js - getClientLocations() => Obteniendo las ubicaciones de los clientes.`
      )

      const query = `SELECT c.nombre AS nombre,
                          c.direccion AS direccion,
                          p.nombre AS poblacion,
                          p.codigo_postal AS codigo_postal
                    FROM vismel.cliente c
                    JOIN vismel.poblacion p ON c.poblacion_id = p.codigo_postal
                    ORDER BY poblacion ASC;
                    `

      this.logger.debug(
        `database.js - getClientLocations() => Query: ${query}`
      )

      const result = await this.query(query)

      this.logger.info(
        `database.js - getClientLocations() => ubicaciones obtenidas correctamente.`
      )

      return result
    } catch (err) {
      this.logger.error(
        `database.js - getClientLocations() => Error: ${err.message}`
      )
      throw err
    }
  }

  /**
   * Crea un nuevo usuario con los atributos indicados, incluyendo el rol.
   * @param {Object} attributes {nombre: "Juan", rol: "admin", password: "..."}
   * @returns {Promise<Array>}
   */
  async createUser(attributes = {}) {
    try {
      this.logger.debug(
        `database.js - createUser() => Atributos recibidos: ${JSON.stringify(attributes)}`
      )

      // Sanitizar: eliminar claves con valores null, undefined o strings vacíos
      const sanitizedAttributes = Object.fromEntries(
        Object.entries(attributes).filter(
          ([_, value]) => value !== null && value !== undefined && value !== ''
        )
      )

      const validKeys = Object.keys(sanitizedAttributes).filter(
        (key) =>
          (VISMEL.USUARIO.includes(key) && !['id', 'rol_id'].includes(key)) ||
          (VISMEL.ROL.includes(key) && key === 'rol')
      )

      if (!validKeys.length) {
        this.logger.error(
          `database.js - createUser() => Atributos inválidos: ${Object.keys(attributes)}`
        )
        return []
      }

      // Validar password (debe venir hasheado)
      if ('password' in sanitizedAttributes) {
        const pwd = sanitizedAttributes.password
        const isHashed =
          typeof pwd === 'string' &&
          pwd.length >= 60 &&
          /^[a-zA-Z0-9./$]{60,}$/.test(pwd)
        if (!isHashed) {
          this.logger.error(
            'database.js - createUser() => El password no está hasheado'
          )
          throw new Error('El campo password debe venir ya cifrado (hasheado).')
        }
      }

      const roleName = sanitizedAttributes.rol || 'default'

      // Verificar existencia del rol
      const roleResult = await this.query(
        'SELECT id FROM vismel.rol WHERE rol = $1',
        [roleName]
      )

      if (!roleResult.length) {
        this.logger.error(
          `database.js - createUser() => Rol no encontrado: "${roleName}"`
        )
        throw new Error(`Rol "${roleName}" no encontrado.`)
      }

      const roleId = roleResult[0].id

      // Filtrar solo campos de usuario válidos
      const userFields = validKeys.filter(
        (k) => VISMEL.USUARIO.includes(k) && k !== 'rol_id'
      )

      if (!userFields.length) {
        this.logger.error(
          `database.js - createUser() => Atributos de usuario inválidos: ${Object.keys(attributes)}`
        )
        return []
      }

      const columns = userFields.map((f) => wrapIfReserved(f))
      const values = userFields.map((f) => sanitizedAttributes[f])

      // Agregar rol_id explícitamente
      columns.push('rol_id')
      values.push(roleId)

      const columnsStr = columns.join(', ')
      const placeholders = values.map((_, i) => `$${i + 1}`)
      const valuesPlaceholderStr = placeholders.join(', ')

      const query = `INSERT INTO vismel.usuario (${columnsStr}) VALUES (${valuesPlaceholderStr}) RETURNING *;`

      this.logger.debug(
        `database.js - createUser() => Query: ${query} | valores: ${JSON.stringify(values)}`
      )

      const result = await this.query(query, values)

      this.logger.info(
        `database.js - createUser() => Usuario creado con ID ${result[0]?.id}`
      )

      return result
    } catch (err) {
      this.logger.error(`database.js - createUser() => Error: ${err.message}`)
      throw err
    }
  }

  /**
   * Edita uno o varios usuarios indicando los atributos a editar y los criterios para encontrarlos.
   * @param {Object} attributes Atributos a actualizar. Ej: {nombre: "Juan", rol: "admin", password: "..."}
   * @param {Object} checkBy Atributos de búsqueda. Ej: {rol: "admin"}
   * @returns {Promise<Array>}
   */
  async updateCommonUsers(attributes = {}, checkBy = {}) {
    try {
      this.logger.debug(
        `database.js - updateCommonUsers() => Atributos recibidos: ${JSON.stringify(attributes)} y ${JSON.stringify(checkBy)}`
      )

      // 1. Sanitizar
      const sanitize = (obj) =>
        Object.fromEntries(
          Object.entries(obj).filter(
            ([_, value]) =>
              value !== null && value !== undefined && value !== ''
          )
        )

      const sanitizedAttributes = sanitize(attributes)
      const sanitizedChecks = sanitize(checkBy)

      // 2. Validar campos permitidos
      const validUpdateKeys = Object.keys(sanitizedAttributes).filter(
        (key) => VISMEL.USUARIO.includes(key) && key !== 'id'
      )
      const validCheckKeys = Object.keys(sanitizedChecks).filter((key) =>
        VISMEL.USUARIO.includes(key)
      )

      if (
        !validUpdateKeys.length &&
        !('rol' in sanitizedAttributes) &&
        !('rol_id' in sanitizedAttributes)
      ) {
        this.logger.error(
          `database.js - updateCommonUsers() => Atributos inválidos: ${Object.keys(attributes)}`
        )
        return []
      }
      if (
        !validCheckKeys.length &&
        !('rol' in sanitizedChecks) &&
        !('rol_id' in sanitizedChecks)
      ) {
        this.logger.error(
          `database.js - updateCommonUsers() => Checks inválidos: ${Object.keys(checkBy)}`
        )
        return []
      }

      // 3. Validar password
      if ('password' in sanitizedAttributes) {
        const pwd = sanitizedAttributes.password
        const isHashed =
          typeof pwd === 'string' &&
          pwd.length >= 60 &&
          /^[a-zA-Z0-9./$]{60,}$/.test(pwd)
        if (!isHashed) {
          this.logger.error(
            'database.js - updateCommonUsers() => El password no está hasheado'
          )
          throw new Error('El campo password debe venir ya cifrado (hasheado).')
        }
      }

      // 4. Resolver rol_id para attributes
      let roleIdUpdate = sanitizedAttributes.rol_id || null
      if (!roleIdUpdate && sanitizedAttributes.rol) {
        const roleRes = await this.query(
          'SELECT id FROM vismel.rol WHERE rol = $1',
          [sanitizedAttributes.rol]
        )
        if (!roleRes.length) {
          this.logger.error(
            `database.js - updateCommonUsers() => Rol no encontrado (attributes): "${sanitizedAttributes.rol}"`
          )
          throw new Error(`Rol "${sanitizedAttributes.rol}" no encontrado.`)
        }
        roleIdUpdate = roleRes[0].id
      }

      // 5. Resolver rol_id para checkBy
      let roleIdCheck = sanitizedChecks.rol_id || null
      if (!roleIdCheck && sanitizedChecks.rol) {
        const roleRes = await this.query(
          'SELECT id FROM vismel.rol WHERE rol = $1',
          [sanitizedChecks.rol]
        )
        if (!roleRes.length) {
          this.logger.error(
            `database.js - updateCommonUsers() => Rol no encontrado (checkBy): "${sanitizedChecks.rol}"`
          )
          throw new Error(`Rol "${sanitizedChecks.rol}" no encontrado.`)
        }
        roleIdCheck = roleRes[0].id
      }

      // 6. Preparar SET y WHERE
      const setParts = []
      const whereParts = []
      const values = []

      // SET (attributes)
      validUpdateKeys.forEach((key) => {
        setParts.push(`${wrapIfReserved(key)} = $${values.length + 1}`)
        values.push(sanitizedAttributes[key])
      })
      if (roleIdUpdate !== null) {
        setParts.push(`rol_id = $${values.length + 1}`)
        values.push(roleIdUpdate)
      }

      // WHERE (checkBy)
      validCheckKeys.forEach((key) => {
        whereParts.push(`${wrapIfReserved(key)} = $${values.length + 1}`)
        values.push(sanitizedChecks[key])
      })
      if (roleIdCheck !== null) {
        whereParts.push(`rol_id = $${values.length + 1}`)
        values.push(roleIdCheck)
      }

      const setClause = setParts.join(', ')
      const whereClause = whereParts.join(' AND ')

      const query = `
      UPDATE vismel.usuario
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *;
    `

      this.logger.debug(
        `database.js - updateCommonUsers() => Query: ${query} | valores: ${JSON.stringify(values)}`
      )

      const result = await this.query(query, values)

      this.logger.info(
        `database.js - updateCommonUsers() => Usuario(s) actualizado(s). Registros modificados: ${result.length}`
      )

      return result
    } catch (err) {
      this.logger.error(
        `database.js - updateCommonUsers() => Error: ${err.message}`
      )
      throw err
    }
  }
}
