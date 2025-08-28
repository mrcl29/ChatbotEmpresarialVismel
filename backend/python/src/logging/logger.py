# backend/python/src/logging/logger.py
import sys
from loguru import logger

# Eliminar configuración por defecto
logger.remove()

# Agregar handler para consola en JSON o texto plano
logger.add(sys.stdout, level="DEBUG", format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level}</level> | <cyan>{extra[session_id]}</cyan> | <level>{message}</level>")

# Logger base con session_id anónimo (por si no se establece explícitamente)
base_logger = logger.bind(session_id="anon")
