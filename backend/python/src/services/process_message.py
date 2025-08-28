# backend/python/src/services/process_message.py
import os
import json
from typing import Optional
import asyncio

from src.logging.logger import base_logger
from src.config.config import DB_HOST, DB_PORT, DB_NAME, DB_SCHEMA, OPENAI_API_KEY, DB_BOT_PASSWORD
from src.db.database import Database
from src.services.openai_llm import OpenaiLLM

""" VARIABLES GLOBALES """
agent: Optional[OpenaiLLM] = None
db: Optional[Database] = None
file_name = os.path.basename(__file__)
""""""""""""""""""""""""""

async def init_agent():
    global agent
    agent = OpenaiLLM(api_key=OPENAI_API_KEY)
    await agent.init()
    
async def init_database():
    global db
    db = Database(
        user="bot",
        password=DB_BOT_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        name=DB_NAME,
        schema=DB_SCHEMA,
    )

async def process_message(message: str, history: dict | list[dict], logger=base_logger):
    """
    Procesa un mensaje entrante.
    Intenta obtener respuesta desde la DB mediante queries. Si falla, responde sin datos.
    """

    try:
        if not agent:
            await init_agent()
        if not db:
            await init_database()
        
        logger.info(f"{file_name} => Inicio process_message...")
        if not history:
            history = {}
        else:
            logger.debug(f"{file_name} => Historial recibido...")
        logger.debug(f"{file_name} => Mensaje recibido: {message}")
        
        if agent and db:
            # 1. Verificar conexión a la base de datos
            if not await db.test_connection(logger):
                logger.warning(f"{file_name} => No se pudo conectar a la base de datos.")
                return await agent.build_answer_without_query(message=message, history=history)

            # 2. Obtener esquema de la base de datos
            db_schema = await db.get_schema(logger=logger)
            static_tables = await db.get_static_tables(logger=logger)
            if not db_schema:
                logger.error(f"{file_name} => No se pudo obtener el esquema de la base de datos.")
                return await agent.build_answer_without_query(message=message, db_schema="NO DATA", static_tables=static_tables, history=history)

            logger.debug(f"{file_name} => Esquema de DB obtenido correctamente.")

            # 3. Obtener respuesta del agente
            raw_response = await agent.get_response(message, db_schema=db_schema, static_tables=static_tables, history=history)
            if not raw_response:
                logger.error(f"{file_name} => Respuesta del agente vacía.")
                return await agent.build_answer_without_query(message=message, db_schema=db_schema, static_tables=static_tables, history=history)

            try:
                agent_response = json.loads(raw_response)
            except json.JSONDecodeError as jde:
                logger.error(f"{file_name} => Error al parsear JSON: {jde}")
                agent_response = raw_response

            return await handle_agent_response(agent_response, message, db_schema, static_tables=static_tables, history=history, logger=logger)

    except Exception as e:
        logger.exception(f"{file_name} => Excepción en process_message: {e}")
        raise  # Re-lanzamos para que el endpoint maneje la excepción
    finally:
        try:
            if agent:
                loop = asyncio.get_event_loop()
                loop.create_task(agent.close_thread())
        except Exception as e:
            logger.exception(f"{file_name} => No se ha podido cerrar el cliente del agente OpenaiLLM: {e}")
            raise  # Re-lanzamos para que el endpoint maneje la excepción


async def handle_agent_response(agent_response, message, db_schema, static_tables: dict, history: dict | list[dict], logger=base_logger):
    """
    Maneja la respuesta del agente y construye la respuesta final.
    """
    try:
        if not agent:
            await init_agent()
        if not db:
            await init_database()
            
        logger.debug(f"{file_name} => Inicio handle_agent_response...")
        if isinstance(agent_response, dict):
            response = agent_response.get("response", "")
            query = agent_response.get("sql_query", "")
            extra_sql_query = agent_response.get("extra_sql_query", "")
        else:
            response = agent_response
            query = ""
            extra_sql_query = ""

        if query:
            return await run_query_and_build_answer(
                query, 
                message, 
                db_schema, 
                static_tables=static_tables, 
                history=history, 
                logger=logger
            )

        elif extra_sql_query:
            return await handle_extra_query(
                extra_sql_query,
                message, 
                db_schema, 
                static_tables=static_tables, 
                history=history, 
                logger=logger
            )

        elif response:
            return response

        logger.warning(f"{file_name} => La respuesta del agente no contiene ni query ni respuesta directa.")
        return await agent.build_answer_without_query(message=message, db_schema=db_schema, static_tables=static_tables, history=history) if agent else None
    
    except Exception as e:
        logger.exception(f"{file_name} => Excepción en handle_agent_response: {e}")
        raise  # Re-lanzamos para que el endpoint maneje la excepción


async def handle_extra_query(extra_query, message, db_schema, static_tables: dict, history: dict | list[dict], logger=base_logger):
    """
    Maneja el flujo cuando se necesita una query adicional antes de construir la final.
    """
    try:
        if not agent:
            await init_agent()
        if not db:
            await init_database()
            
        logger.debug(f"{file_name} => Inicio handle_extra_query...")
        
        if agent and db:
            results = await db.query(extra_query, logger=logger)
            if not results:
                logger.warning(f"{file_name} => Sin resultados para extra_sql_query.")
                return await agent.build_answer_without_query(
                    message=message, 
                    db_schema=db_schema, 
                    static_tables=static_tables, 
                    sql_query=extra_query, 
                    history=history
                )

            res2 = await agent.get_query_from_previous_data(
                message=message,
                db_schema=db_schema,
                static_tables=static_tables,
                previous_sql=extra_query,
                previous_result=results,
                history=history
            )

            if not res2:
                logger.error(f"{file_name} => Respuesta del agente tras extra_query vacía.")
                return await agent.build_answer_without_query(message=message, db_schema=db_schema, static_tables=static_tables, history=history)

            try:
                agent_response2 = json.loads(res2)
            except json.JSONDecodeError as jde:
                logger.error(f"{file_name} => Error al parsear JSON del segundo paso: {jde}")
                agent_response2 = res2

            if isinstance(agent_response2, dict):
                response = agent_response2.get("response", "")
                query = agent_response2.get("sql_query", "")
            else:
                response = ""
                query = ""

            if query:
                return await run_query_and_build_answer(
                    query, 
                    message, 
                    db_schema, 
                    static_tables=static_tables, 
                    history=history, 
                    logger=logger
                )
            elif response:
                return response

            logger.warning(f"{file_name} => Sin query ni respuesta tras extra_sql_query.")
            return await agent.build_answer_without_query(message=message, db_schema=db_schema, static_tables=static_tables, history=history)
        
    except Exception as e:
        logger.exception(f"{file_name} => Excepción en handle_extra_query: {e}")
        raise  # Re-lanzamos para que el endpoint maneje la excepción

async def run_query_and_build_answer(query, message, db_schema, static_tables: dict, history: dict | list[dict], logger=base_logger):
    """
    Ejecuta una query y construye una respuesta a partir de sus resultados.
    """
    try:
        if not agent:
            await init_agent()
        if not db:
            await init_database()
            
        logger.debug(f"{file_name} => Inicio run_query_and_build_answer...")
        
        if agent and db:
            results = await db.query(query, logger=logger)
            if results:
                return await agent.build_answer_from_query(result=results, message=message, db_schema=db_schema, static_tables=static_tables, sql_query=query, history=history)
            else:
                logger.warning(f"{file_name} => Query ejecutada pero sin resultados.")
                return await agent.build_answer_without_query(message=message, db_schema=db_schema, static_tables=static_tables, sql_query=query, history=history)
            
    except Exception as e:
        logger.exception(f"{file_name} => Excepción en run_query_and_build_answer: {e}")
        raise  # Re-lanzamos para que el endpoint maneje la excepción