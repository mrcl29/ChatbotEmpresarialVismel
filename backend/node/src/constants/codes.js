// backend/node/src/constants/codes.js

export const CODES = {
  PARAM_ERROR: {
    CODE: 400,
    MESSAGE: 'El parámetro enviado es incorrecto o no existe',
  },

  USERNAME_REQUIRED: {
    CODE: 400,
    MESSAGE: 'El nombre de usuario es requerido',
  },

  PASSWORD_REQUIRED: {
    CODE: 400,
    MESSAGE: 'La password es requerida',
  },

  PASSWORD_TOO_SHORT: {
    CODE: 400,
    MESSAGE: 'La contraseña debe tener al menos 6 caracteres',
  },

  USER_QUERY_ERROR: {
    CODE: 400,
    MESSAGE: 'Error durante la creación del usuario',
  },

  INVALID_UPDATE_FORMAT: {
    CODE: 400,
    MESSAGE: 'Formato de entrada inválido para actualización de usuarios',
  },

  INVALID_ARRAY_FORMAT: {
    CODE: 400,
    MESSAGE: 'Los datos deben enviarse en una array con almenos un elemento',
  },

  MESSAGE_REQUIRED: {
    CODE: 400,
    MESSAGE: 'El mensaje es requerido y debe ser un texto válido',
  },

  INVALID_CREDENTIALS: {
    CODE: 401,
    MESSAGE: 'Credenciales inválidas',
  },

  MISSING_TOKEN: {
    CODE: 401,
    MESSAGE: 'Token no proporcionado',
  },

  INVALID_TOKEN: {
    CODE: 401,
    MESSAGE: 'Token inválido',
  },

  TOKEN_REQUIRED: {
    CODE: 401,
    MESSAGE: 'Token requerido',
  },

  TOKEN_EXPIRED_OR_INVALID: {
    CODE: 401,
    MESSAGE: 'Token inválido o expirado',
  },

  FORBIDDEN: {
    CODE: 403,
    MESSAGE: 'No tienes permiso para acceder a este recurso',
  },

  USER_NOT_FOUND: {
    CODE: 404,
    MESSAGE: 'Usuario no encontrado',
  },

  ROUTE_NOT_FOUND: {
    CODE: 404,
    MESSAGE: 'Ruta no encontrada',
  },

  USER_ALREADY_EXISTS: {
    CODE: 409,
    MESSAGE: 'El usuario ya existe',
  },

  LIMIT_CHARS: {
    CODE: 413,
    MESSAGE: 'Límite de caracteres alcanzado',
  },

  DB_INSTANCE_MISSING: {
    CODE: 500,
    MESSAGE: 'Error interno: instancia de base de datos no disponible',
  },

  USER_CREATION_FAILED: {
    CODE: 500,
    MESSAGE: 'No se pudo crear el usuario',
  },

  DUPLICATE_USERS_FOUND: {
    CODE: 500,
    MESSAGE: 'Se encontraron múltiples usuarios con el mismo nombre',
  },

  INTERNAL_ERROR: {
    CODE: 500,
    MESSAGE: 'Error interno',
  },

  DB_CONNECTION_FAILED: {
    CODE: 500,
    MESSAGE: 'No se pudo conectar a la base de datos',
  },

  BOT_RESPONSE_INVALID: {
    CODE: 500,
    MESSAGE: 'Respuesta inválida del bot',
  },

  ERROR_GET_HISTORY: {
    CODE: 500,
    MESSAGE: 'No se ha podido obtener el historial',
  },

  ERROR_DELETE_HISTORY: {
    CODE: 500,
    MESSAGE: 'No se ha podido eliminar el historial',
  },
}
