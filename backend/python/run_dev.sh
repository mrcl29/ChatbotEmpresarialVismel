#!/bin/bash

# Salir si ocurre un error
set -e

# Crear el entorno virtual si no existe
if [ ! -d "./venv" ]; then
  echo "🛠️  Creando entorno virtual en ./venv..."
  python3 -m venv venv
fi

# Activar el entorno virtual
source ./venv/bin/activate

# Instalar dependencias si requirements.txt existe
if [ -f "requirements.txt" ]; then
  echo "📦 Instalando dependencias..."
  pip install --upgrade pip
  pip install -r requirements.txt
fi

# Asegurar que uvicorn esté instalado
if ! python -m uvicorn --version &> /dev/null; then
  echo "❌ uvicorn no está instalado. Ejecuta: pip install uvicorn"
  exit 1
fi

# Establecer variables de entorno
export PYTHONPATH=$(pwd)
export PYTHONDONTWRITEBYTECODE=1

# Ejecutar la aplicación
echo "✅ Iniciando aplicación con uvicorn..."
python src/main.py
