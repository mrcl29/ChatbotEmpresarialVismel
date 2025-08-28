# backend/python/src/models/Response.py
from typing import Any, Optional
from pydantic import BaseModel

class APIResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Optional[Any] = None
    errors: Optional[Any] = None