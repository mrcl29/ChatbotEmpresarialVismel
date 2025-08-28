# backend/python/src/utils/response.py
from typing import Any
from fastapi.responses import JSONResponse

from src.models.Response import APIResponse

def success_response(message: str = "", data: Any = None, status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content=APIResponse(
            status="success",
            message=message,
            data=data
        ).model_dump()
    )

def error_response(message: str = "", errors: Any = None, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content=APIResponse(
            status="error",
            message=message,
            errors=errors
        ).model_dump()
    )
