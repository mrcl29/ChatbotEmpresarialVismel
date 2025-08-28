# *********** FRONTEND DOCKERFILE *********** #

# - DESARROLLO -

# # Usa una imagen ligera con Node.js
# FROM node:22.15.0-alpine

# # Establece el directorio de trabajo dentro del contenedor
# WORKDIR /src

# # Instala pnpm globalmente
# RUN npm install -g pnpm

# # Copia los archivos necesarios para instalar dependencias
# COPY package.json pnpm-lock.yaml* ./

# # Instala dependencias
# RUN pnpm install

# # Copia el resto del código fuente
# COPY . .

# # Construye la app para producción
# RUN pnpm run build

# # Expone el puerto por defecto de Vite (en desarrollo)
# EXPOSE ${PORT}

# # Comando para desarrollo (puedes cambiar a servir la build si es producción)
# CMD ["pnpm", "run", "dev"]

# - PRODUCCIÓN -

# --- Etapa build ---
FROM node:22.15.0-alpine AS builder

WORKDIR /src/frontend

RUN npm install -g pnpm

# Copiar sólo lo necesario para instalar deps
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Copiar todo el frontend primero
COPY frontend ./
COPY .env .env

# Instalar deps y generar node_modules
RUN pnpm install

RUN pnpm list vite
# Construir la app con vite.config.js en frontend/
RUN pnpm run build

# --- Etapa producción ---
FROM node:22.15.0-alpine AS runner

WORKDIR /src/frontend

RUN npm install -g serve

# Copiar sólo la carpeta dist generada en la build
COPY --from=builder /src/frontend/dist ./dist
COPY .env .env

RUN apk add --no-cache tini

ENV PORT=${FRONTEND_PORT}

EXPOSE ${FRONTEND_PORT}

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "serve -s dist -l ${PORT:-5173}"]

