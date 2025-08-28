# backend/python/src/config/config.py
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"
PYTHON_ENV_FILE = BASE_DIR / ".env"

"""
Constantes Globales
"""
# Cargar .env global
load_dotenv(ENV_FILE)

HOST=os.getenv("VITE_HOST", "localhost")
PORT=int(os.getenv("VITE_BACKEND_PYTHON_PORT", 8000))
BACKEND_NODE_PORT=int(os.getenv("VITE_BACKEND_NODE_PORT", 3000))

DB_HOST=os.getenv("DB_HOST", os.getenv("VITE_HOST", 'localhost'))
DB_PORT=int(os.getenv("DB_PORT", 5432))
# DB_USER=os.getenv("DB_USER")
# DB_PASSWORD=os.getenv("DB_PASSWORD")
DB_BOT_PASSWORD=os.getenv("DB_BOT_PASSWORD")
DB_NAME=os.getenv("DB_NAME")
DB_SCHEMA=os.getenv("DB_SCHEMA")

TIMEZONE=os.getenv("TIMEZONE", "Europe/Madrid")

INTERNAL_API_KEY=os.getenv("INTERNAL_API_KEY")

MODEL=os.getenv("VITE_MODEL", "gpt-4.1-mini-2025-04-14")
MAX_TOTAL_CHARS=int(os.getenv("VITE_MAX_TOTAL_CHARS", 800000))
max_history_chars = MAX_TOTAL_CHARS / 2
MAX_CHAR_USER_MESSAGE=int((max_history_chars / 20) - 2000)
MAX_CHAR_BOT_MESSAGE=int((max_history_chars / 20) - 2000)
MAX_CHAR_DATA=int((MAX_TOTAL_CHARS / 2) - 20000)
# El promt de contexto es fijo y no llega a 20.000 caracteres. Suponemos ese límite para dar margen.

"""
Constantes Del Servicio
"""
# Cargar .env de python
load_dotenv(PYTHON_ENV_FILE)
OPENAI_API_KEY=os.getenv("OPENAI_API_KEY", "")
ASSISTANT_ID=os.getenv("ASSISTANT_ID", "")
VECTOR_STORE_ID=os.getenv("VECTOR_STORE_ID", "")
static_tables_str=os.getenv("STATIC_TABLES","")
static_tables=static_tables_str.split(",") if static_tables_str else []
STATIC_TABLES = [t.strip() for t in static_tables]