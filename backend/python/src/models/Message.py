# backend/python/src/models/Message.py
from typing import Optional, Any
from pydantic import BaseModel, Field

class Message(BaseModel):
    """
    Objeto que representa el mensaje que llega a body de la petición a la API.
    """
    message: str = Field(..., examples=["¿Cuántos usuarios hay registrados?"])
    history: Optional[dict | list[dict] | Any] = Field(None)