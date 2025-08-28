# Usa la imagen oficial de Node.js con versión 22.15.0 Alpine
FROM node:22.15.0-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /src

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia package.json y pnpm-lock.yaml para instalar dependencias
COPY package.json pnpm-lock.yaml* ./

# Instala las dependencias con pnpm
RUN pnpm install

# Copia el código fuente
COPY src/ ./src/

# Expone el puerto en el que la app correrá
EXPOSE ${PORT}

# Comando para iniciar la app
CMD ["pnpm", "start"]