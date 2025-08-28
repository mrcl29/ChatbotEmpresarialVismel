# backend/python/src/utils/format.py
from typing import Any
from datetime import datetime

def build_prompt(template: str, context: dict[str, Any]) -> str:
        context["current_date"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return template.format(**context)
    
def format_history_for_openai(history) -> list[dict[str, Any]]:
        messages = []
        for interaction in history:
            user_msg = interaction.get("user")
            bot_msg = interaction.get("bot", interaction.get("assistant"))
            if user_msg:
                messages.append({"role": "user", "content": user_msg})
            if bot_msg:
                messages.append({"role": "assistant", "content": bot_msg})
        return messages
    
def build_messages(prompt: str, message: str, history: dict | list[dict] = []) -> list[dict[str, Any]]:
    messages:  list[dict[str, Any]] = []
    if history: # Añadimos el historial si existe
        messages.extend(format_history_for_openai(history)) 
    # Para Assistants solo se permite el rol "user" o "assistant"
    messages.append({"role": "system", "content": prompt})
    messages.append({"role": "user", "content": message})
    return messages