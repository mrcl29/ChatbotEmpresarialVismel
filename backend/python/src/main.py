# backend/python/src/main.py
"""
BIBLIOGRAFÍA
----------------
https://www.youtube.com/watch?v=3KVqlIF0zZw
"""
import uvicorn
from fastapi import FastAPI, Request, status
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

from src.config.rate_limiter import limiter
from src.config.config import HOST, PORT
from src.routes.agent import setup_routes
from src.utils.responses import error_response

app = FastAPI(
    title="ChatBot Vismel",
    description="API para interactuar con agente LLM de Vismel",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware) # Middleware que aplica el control de peticiones

# Registrar las rutas de la aplicación
setup_routes(app)

# En caso de error por límite de solicitudes de enviará esta respuesta
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return error_response(message="Demasiadas solicitudes. Intenta más tarde.",status_code=status.HTTP_429_TOO_MANY_REQUESTS)

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)