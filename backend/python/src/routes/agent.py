# backend/python/src/routes/agent.py
import os
from fastapi import FastAPI, APIRouter, Request, Header, status

from src.logging.logger import base_logger
from src.config.config import INTERNAL_API_KEY
from src.config.rate_limiter import limiter
from src.services.process_message import init_agent, init_database, process_message
from src.models.Message import Message
from src.utils.responses import success_response, error_response, APIResponse

""" VARIABLES GLOBALES """
file_name = os.path.basename(__file__)
""""""""""""""""""""""""""

router = APIRouter(
    prefix="/agent",
    tags=["Agente conversacional"]
)

def setup_routes(app: FastAPI):
    @app.on_event("startup")
    async def startup_event():
        await init_agent()
        await init_database()

    app.include_router(router)

"""
Endpoint para interactuar con el agente. Solo accesible desde el backend autorizado.
"""
@router.post("/talk", 
    response_model=APIResponse,
    name="Conversar con el agente",
    operation_id="talk_to_agent",
    description="Recibe una consulta en lenguaje natural, la transforma internamente en una consulta SQL, accede a la base de datos y devuelve los resultados."
)
@limiter.limit("20/minute")  # Límite de 10 solicitudes por minuto
async def talk(
    request: Request,
    body: Message,
    session_id: str = Header(..., alias="X-Session-ID", description="Identificador único de la sesión"),
    api_key: str = Header(..., alias="X-Internal-API-Key", description="Clave de autenticación interna")
):
    logger = base_logger.bind(session_id=session_id)
    
    logger.info(f"{file_name} => Inicio de procesamiento del endpoint /talk")

    if api_key != INTERNAL_API_KEY:
        logger.warning(f"{file_name} => API key inválida: {api_key}")
        return error_response(
            message="API-Key no válida. No tiene permisos.",
            status_code=status.HTTP_403_FORBIDDEN
        )

    if not session_id.strip():
        logger.warning(f"{file_name} => session_id vacío o inválido.")
        return error_response(
            message="session_id inválido.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    try:
        logger.debug(f"{file_name} => Body recibido: {body.dict()}")
        history = body.history
        # Si es un dict, todo bien.
        if isinstance(history, dict) or isinstance(history, list):
            pass
        else:
            history = {}
            
        logger.debug(f"{file_name} => Message recibido: {body.message}")
        logger.debug(f"{file_name} => History recibido: {history}")
        
        answer = await process_message(body.message, history, logger)

        if answer is None:
            logger.info(f"{file_name} => No se encontraron resultados para la consulta.")
            return success_response(
                message="No se encontraron resultados para la consulta.",
                data=None
            )

        logger.info(f"{file_name} => Respuesta enviada exitosamente.")
        return success_response(
            message="El agente respondió.",
            data=answer
        )

    except ValueError as ve:
        logger.error(f"{file_name} => Error controlado: {ve}")
        return error_response(
            message="Ocurrió un error inesperado.",
            errors=str(ve),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        logger.exception(f"{file_name} => Error inesperado: {e}")
        return error_response(
            message="Ocurrió un error inesperado.",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )