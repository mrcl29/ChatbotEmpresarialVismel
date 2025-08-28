// backend/node/src/config/env.js
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Resuelve la ruta al root del proyecto
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../../..')
const BASE_DIR = path.resolve(__dirname, '../..')

dotenv.config({ path: path.resolve(ROOT_DIR, '.env') })

const max_total_chars = process.env.VITE_MAX_TOTAL_CHARS || 800000;
const max_history_chars = max_total_chars / 2;

// Exportar variables como constantes con validación y valores por defecto
const GLOBAL_ENV = {
  HOST: process.env.VITE_HOST || 'localhost',
  PORT: process.env.VITE_BACKEND_NODE_PORT,
  FRONTEND_HOST: process.env.FRONTEND_HOST || process.env.VITE_HOST || 'localhost',
  FRONTEND_PORT: process.env.VITE_FRONTEND_PORT,
  BOT_HOST: process.env.BOT_HOST || process.env.VITE_HOST || 'localhost',
  BOT_PORT: process.env.VITE_BACKEND_PYTHON_PORT,

  DB: {
    HOST: process.env.DB_HOST || process.env.VITE_HOST || 'localhost',
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD?.replace(/(^"|"$)/g, ''),
    NAME: process.env.DB_NAME?.replace(/(^"|"$)/g, ''),
    SCHEMA: process.env.DB_SCHEMA?.replace(/(^"|"$)/g, ''),
  },

  REDIS: {
    HOST: process.env.REDIS_HOST || process.env.VITE_HOST || 'localhost',
    PORT: process.env.REDIS_PORT,
    PASSWORD: process.env.REDIS_PASSWORD,
  },

  API: {
    EXAMPLE: process.env.VITE_API_EXAMPLE,
    LOGIN: process.env.VITE_API_LOGIN,
    REGISTER: process.env.VITE_API_REGISTER,
    USERS: process.env.VITE_API_USERS,
    ROLES: process.env.VITE_API_ROLES,
    TALK: process.env.VITE_API_TALK,
    DASHBOARD: process.env.VITE_API_DASHBOARD,
  },

  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,

  TIMEZONE: process.env.TIMEZONE || 'Europe/Madrid',

  LIMIT: {
    MAX_TOTAL_CHARS: max_total_chars,
    MAX_CHAR_USER_MESSAGE: (max_history_chars / 20) - 2000,
    MAX_CHAR_BOT_MESSAGE: (max_history_chars / 20) - 2000,
    MAX_CHAR_DATA: (max_total_chars / 2) - 20000,
  }, // El promt de contexto es fijo y no llega a 20.000 caracteres. Suponemos ese límite para dar margen.

  NODE_ENV: process.env.VITE_ENV,
}

dotenv.config({ path: path.resolve(BASE_DIR, '.env') })

const LOCAL_ENV = {
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
}

export default {
  ...GLOBAL_ENV,
  ...LOCAL_ENV,
}
