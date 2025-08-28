#!/bin/bash

# Nombre del proyecto docker-compose (ajustar si usas -p o nombre distinto)
COMPOSE_PROJECT_NAME=$(basename $(pwd))

echo "Deteniendo y eliminando contenedores..."
docker-compose down --volumes --remove-orphans

echo "Eliminando imágenes del proyecto..."
docker images --filter "reference=${COMPOSE_PROJECT_NAME}_*" -q | xargs -r docker rmi -f

echo "Eliminando volúmenes huérfanos..."
docker volume prune -f

echo "Eliminando redes huérfanas..."
docker network prune -f

echo "Construyendo sin cache..."
docker-compose build --no-cache

echo "Arrancando en segundo plano..."
docker-compose up -d

echo "Proceso completado."
