import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Carga variables del root y del frontend
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const localEnv = loadEnv(mode, process.cwd(), "");
  const extraEnv1 = loadEnv(mode, __dirname, "");
  const extraEnv2 = loadEnv(mode, path.resolve(__dirname), "");

  const env = { ...rootEnv, ...localEnv, ...extraEnv1, ...extraEnv2 };

  const max_total_chars = env.VITE_MAX_TOTAL_CHARS || 800000;
  const max_history_chars = max_total_chars / 2;

  // Crear objeto personalizado con tus variables
  const MY_ENV = {
    HOST: env.VITE_HOST,
    FRONTEND_PORT: env.VITE_FRONTEND_PORT,
    BACKEND_NODE_HOST:
      env.VITE_BACKEND_NODE_HOST || env.VITE_HOST || "localhost",
    BACKEND_NODE_PORT: env.VITE_BACKEND_NODE_PORT,

    API: {
      EXAMPLE: env.VITE_API_EXAMPLE,
      LOGIN: env.VITE_API_LOGIN,
      REGISTER: env.VITE_API_REGISTER,
      USERS: env.VITE_API_USERS,
      ROLES: env.VITE_API_ROLES,
      TALK: env.VITE_API_TALK,
      DASHBOARD: env.VITE_API_DASHBOARD,
    },

    DEV: env.VITE_ENV,

    LIMIT: {
      MAX_TOTAL_CHARS: max_total_chars,
      MAX_CHAR_USER_MESSAGE: max_history_chars / 20 - 2000,
      MAX_CHAR_BOT_MESSAGE: max_history_chars / 20 - 2000,
      MAX_CHAR_DATA: max_total_chars / 2 - 20000,
    },
    // El promt de contexto es fijo y no llega a 20.000 caracteres. Suponemos ese límite para dar margen.
  };

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __MY_ENV__: JSON.stringify(MY_ENV),
    },
    build: {
      outDir: "dist",
    },
    // Solo activa el servidor en modo dev
    ...(env.ENV === "development"
      ? {
          server: {
            host: "0.0.0.0",
            port: parseInt(MY_ENV.FRONTEND_PORT),
          },
        }
      : {}),
  };
});
