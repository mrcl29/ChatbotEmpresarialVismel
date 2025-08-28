# Usa Python 3.12.3 como imagen base
FROM python:3.12.3-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /src

# Copia e instala las dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código fuente
COPY src/ ./src/

# Establece variables de entorno
ENV PYTHONPATH=src \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Expone el puerto donde corre Uvicorn
EXPOSE ${PORT}

# Comando de inicio
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT}"]
