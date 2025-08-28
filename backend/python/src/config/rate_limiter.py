# backend/python/src/config/rate_limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

def get_rate_limit_key(request: Request):
    # Busca session_id en JSON body, headers o query param
    session_id = (
        request.headers.get("X-Session-Id")
        or request.query_params.get("session_id")
    )
    if session_id:
        return session_id

    # Fallback: IP del cliente
    return get_remote_address(request)

limiter = Limiter(key_func=get_rate_limit_key)
