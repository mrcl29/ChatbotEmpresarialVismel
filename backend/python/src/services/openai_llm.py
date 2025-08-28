# backend/python/src/services/openai_llm.py
import os
import json
import backoff
import asyncio
from typing import Any, Optional, List, Tuple, Dict, Literal
from openai import AsyncOpenAI, OpenAIError, RateLimitError, APITimeoutError, APIConnectionError

from src.logging.logger import base_logger
from src.constants.agent_prompts import PROMPTS
from src.config.config import MODEL, MAX_CHAR_BOT_MESSAGE, MAX_CHAR_DATA, ASSISTANT_ID, VECTOR_STORE_ID
from src.models.Files import File, FileList
from src.utils.format import build_messages, build_prompt

""" VARIABLES GLOBALES """
MAX_RETRIES = 3
TIMEOUT_SECONDS = 30
LLM_CONCURRENCY_LIMIT = 3  # Máximo 3 llamadas concurrentes al LLM
llm_semaphore = asyncio.Semaphore(LLM_CONCURRENCY_LIMIT)
file_name = os.path.basename(__file__)
""""""""""""""""""""""""""

"""
Objeto que representa un agente LLM con el que conversar.
"""
class OpenaiLLM():
    def __init__(self, api_key, lang="Spanish", limit=MAX_CHAR_BOT_MESSAGE, logger=base_logger):
        # Constantes
        self.api_key = api_key
        self.lang = lang
        self.limit = limit
        self.logger = logger
        self.client: AsyncOpenAI = AsyncOpenAI(api_key=self.api_key)
        
        # Constantes que se deben inicializar
        self.assistant_id: str = ASSISTANT_ID
        self.vector_store_id: str = VECTOR_STORE_ID
        self.openai_files: FileList = FileList()
        self.vector_store_files: FileList = FileList()
        
        # Variables para cada usuario
        self.thread_id: str = ""
        self.historial_añadido: bool = False
    
    async def init(self, logger=base_logger):
        self.logger = logger
        try:
            self.logger.info(f"{file_name} => Inicializando variables...")            
            # Obtenemos los ficheros guardados en OpenAI y los guardamos en local
            self.openai_files = FileList()
            files_result = await self.client.files.list()
            files_list = files_result.data
            for file in files_list:
                self.openai_files.push(File(id=file.id, name=file.filename))
                
            # Obtenemos el Vector Store ya creado
            vs = await self.client.vector_stores.retrieve(vector_store_id=self.vector_store_id)
            # Sino crearemos uno nuevo
            if not vs:
                vs = await self.client.vector_stores.create(name="Vismel Data")
                self.vector_store_id = vs.id
            
            # Recorremos los ficheros de vector store para eliminarlos todos
            self.vector_store_files = FileList()
            files_vs_result = await self.client.vector_stores.files.list(vector_store_id=self.vector_store_id)
            files_vs_list = files_vs_result.data
            for file in files_vs_list:
                await self.client.vector_stores.files.delete(file_id=file.id, vector_store_id=self.vector_store_id)
                
            # Obtenemos el Assistente ya creado y le añadimos el vector store al que apuntar
            assistant = await self.client.beta.assistants.retrieve(assistant_id=self.assistant_id)
            # Si no crearemos uno nuevo
            if not assistant:
                assistant = await self.client.beta.assistants.create(
                    name="ChatbotVismel",
                    tools=[{"type": "file_search"}],
                    model=MODEL,
                    response_format={"type": "json_object"},
                    tool_resources={"file_search": {"vector_store_ids":[self.vector_store_id]}}
                )
                self.assistant_id = assistant.id
            else:
                await self.client.beta.assistants.update(
                    assistant_id=self.assistant_id,
                    tool_resources={"file_search": {"vector_store_ids":[self.vector_store_id]}}
                )
                
            self.historial_añadido = False
        except Exception as e:
            self.logger.error(f"{file_name} => Error inicializando variables: {e}")
            raise
            
    def log_backoff(self, details):
        self.logger.warning(f"{file_name} => Reintentando por {details['exception']} (intento {details['tries']})")
    
    async def new_thread(self):
        try:
            self.logger.info(f"{file_name} => Creando nuevo thread...")
            thread = await self.client.beta.threads.create()
            self.thread_id = thread.id
            self.historial_añadido = False
            return thread
        except Exception as e:
            self.logger.error(f"{file_name} => Error creando un nuevo thread: {e}")
            raise 
            
    async def continue_thread(self):
        try:
            self.logger.info(f"{file_name} => Continuando thread...")
            if not self.thread_id:
                await self.new_thread()
            return self.thread_id
        except Exception as e:
            self.logger.error(f"{file_name} => Error al continuar thread: {e}")
            raise 
        
    async def close_thread(self):
        try:
            self.logger.info(f"{file_name} => Cerrando thread...")
            thread = None
            if self.thread_id:
                thread = await self.client.beta.threads.delete(self.thread_id)
            self.thread_id = ""
            self.historial_añadido = False
            return thread
        except Exception as e:
            self.logger.error(f"{file_name} => Error cerrando un thread: {e}")
            raise 
        
    async def _add_message_to_thread(self, message: str, role: Literal['user','assistant'] = "user"):
        try:
            self.logger.info(f"{file_name} => Añadiendo un nuevo mensaje al thread...")
            msg = await self.client.beta.threads.messages.create(
                thread_id=self.thread_id,
                role=role,
                content=message
            )
        except Exception as e:
            self.logger.error(f"{file_name} => Error añadiendo un nuevo mensaje al thread: {e}")
            raise 
        
    async def _run_thread(self, prompt: str = ""):
        try:
            self.logger.info(f"{file_name} => Corriendo thread...")
            if prompt:
                run = await self.client.beta.threads.runs.create_and_poll(
                    thread_id=self.thread_id,
                    assistant_id=self.assistant_id,
                    instructions=prompt,
                )
            else:
                run = await self.client.beta.threads.runs.create_and_poll(
                    thread_id=self.thread_id,
                    assistant_id=self.assistant_id,
                )
                
            messages = await self.client.beta.threads.messages.list(
                thread_id=self.thread_id,
                run_id=run.id,
            )
            self.logger.debug(f"{file_name} => Messages recibidos: {messages}")
            msg = messages.data[0]
            return messages.data[0].content[0].text.value if msg else None
        except Exception as e:
            self.logger.error(f"{file_name} => Error obteniendo la respuesta de la run de un thread: {e}")
            raise
            
    async def _create_file(self, data: str | dict | list[dict], name: str, directory: str = "tmp") -> File:
        try:
            # Asegura que el directorio exista
            os.makedirs(directory, exist_ok=True)

            # Construir ruta final
            file_path = os.path.join(directory, f"{name}")
            
            exist_file_in_openai = self.openai_files.get_file_by_name(name)
            # Si existe el fichero en openai lo recuperamos
            if exist_file_in_openai:
                exist_file_in_vs = self.vector_store_files.get_file_by_id(exist_file_in_openai.id)
                if not exist_file_in_vs: # Si no existe en el vector store lo guaramos porque lo vamos a usar
                    await self.client.vector_stores.files.create(vector_store_id=self.vector_store_id, file_id=exist_file_in_openai.id)
                    self.vector_store_files.push(exist_file_in_openai)
                self.logger.info(f"{file_name} => Usando archivo existente...")
                return exist_file_in_openai # Devolvemos el fichero existente
            else:# Si NO existe el fichero en openai lo creamos
                self.logger.info(f"{file_name} => Generando nuevo fichero...")
                # Escribir contenido
                with open(file_path, "w", encoding="utf-8") as f:
                    if "json" in name:
                        json.dump(data, f, ensure_ascii=False, indent=4)
                    else:
                        f.write(str(data))

                # Lo creamos en openai y recuperamos su id
                file_openai = await self.client.files.create(file=open(file_path, "rb"), purpose="assistants")
                file_id = file_openai.id
                
                # Lo creamos en el vector store porque lo vamos a usar
                await self.client.vector_stores.files.create(vector_store_id=self.vector_store_id, file_id=file_id)

                self.logger.info(f"{file_name} => Archivo temporal subido correctamente: {file_id} - {name}")
                f = File(id=file_id, name=name)
                # Guardamos los ficheros en sus respectivas caches
                self.openai_files.push(file=f)
                self.vector_store_files.push(file=f)
                return f
        except Exception as e:
            self.logger.error(f"{file_name} => Error al crear un nuevo archivo: {e}")
            raise
        
    async def _delete_file_from_op(self, id: str = "", name: str = "") -> File | None:
        try:
            file = None
            if id:
                file_openai = await self.client.files.delete(file_id=id)
                if file_openai:
                    file = self.openai_files.delete_file_by_id(id=file_openai.id)
            elif name:
                file = self.openai_files.get_file_by_name(name=name)
                if file:
                    file_openai = await self.client.files.delete(file_id=file.id)
                    if file_openai:
                        file = self.openai_files.delete_file_by_id(id=file_openai.id)
            return file
        except Exception as e:
            self.logger.error(f"{file_name} => Error al eliminar un archivo de openai: {e}")
            raise
        
    async def _delete_file_from_vs(self, id: str = "", name: str = "") -> File | None:
        try:
            file = None
            if id:
                file_vs = await self.client.vector_stores.files.delete(vector_store_id=self.vector_store_id, file_id=id)
                if file_vs:
                    file = self.openai_files.delete_file_by_id(id=file_vs.id)
            elif name:
                file = self.openai_files.get_file_by_name(name=name)
                if file:
                    file_vs = await self.client.vector_stores.files.delete(vector_store_id=self.vector_store_id, file_id=file.id)
                    if file_vs:
                        file = self.openai_files.delete_file_by_id(id=file_vs.id)
            return file
        except Exception as e:
            self.logger.error(f"{file_name} => Error al eliminar un archivo del vector store: {e}")
            raise
        
    async def _delete_file(self, id: str = "", name: str = "", directory: str = "tmp"):
        file: File | None = None
        try:
            file_o = await self._delete_file_from_op(id=id, name=name)
            file_v = await self._delete_file_from_vs(id=id, name=name)
            if file_o:
                file = file_o
            elif file_v:
                file = file_v
            
            if file and file.name:
                file_path = os.path.join(directory, f"{file.name}")
                os.remove(path=file_path)
        except Exception as e:
            self.logger.warning(f"{file_name} => Error al eliminar un archivo por completo: {e}")
        finally:
            return file

    @backoff.on_exception(
        backoff.expo,
        (RateLimitError, APIConnectionError, APITimeoutError),
        max_tries=MAX_RETRIES,
        on_backoff=log_backoff
    )
    async def _call_openai(self, messages: list[dict]) -> Optional[str]:
        res = None
        async with llm_semaphore:
            try:
                response = await self.client.chat.completions.create(
                    model=MODEL,
                    messages=messages,
                    response_format={"type": "json_object"},
                )
                res = response.choices[0].message.content
                self.logger.debug(f"{file_name} => _call_openai res: {res}")
            except OpenAIError as e:
                self.logger.error(f"{file_name} => Error en _call_openai (OpenAIError): {e}")
            except Exception as e:
                self.logger.exception(f"{file_name} => Error inesperado en _call_openai: {e}")
            finally:
                return res
            
    """
    Procesa un fragmento del prompt. Si es muy largo, lo guarda en un archivo.
    """
    async def _process_prompt_part(self, name: str, content: str | dict | list[dict], max_length: int) -> str:
        try:
            if len(str(content)) > max_length:
                file = await self._create_file(content, name=name)
                return f"In the file with id: {file.id}"
            return str(content)
        except Exception as e:
            self.logger.error(f"{file_name} => Error al procesar una parte del prompt: {e}")
            raise

    """
    Procesa múltiples fragmentos de datos, asegurando que el total no exceda el máximo.
    """
    async def _process_prompts(self, prompt_parts: List[Tuple[str, str | dict | list[dict]]], max_length: int) -> Dict[str, str]:
        try:
            processed = {name: await self._process_prompt_part(name, content, max_length)
                        for name, content in prompt_parts}

            total_length = sum(len(p) for p in processed.values())
            
            # Si aún combinados sobrepasan el límite, dividir más
            if total_length > max_length:
                for name, original_content in prompt_parts:
                    if not processed[name].startswith("In the file"):
                        file = await self._create_file(original_content, name=name)
                        processed[name] = f"In the file with id: {file.id}"
                        total_length = sum(len(p) for p in processed.values())
                        if total_length <= max_length:
                            break
            return processed
        except Exception as e:
            self.logger.error(f"{file_name} => Error al procesar el prompt: {e}")
            raise
    
    async def _insert_history_messages_in_thread(self, history):
        try:
            if not self.historial_añadido:
                self.logger.info(f"{file_name} => Añadiendo el historial...")
                for interaction in history:
                    user_msg = interaction.get("user")
                    bot_msg = interaction.get("bot")
                    if user_msg:
                        await self._add_message_to_thread(message=user_msg, role='user')
                    if bot_msg:
                        await self._add_message_to_thread(message=bot_msg, role='assistant')
            else:
                self.logger.info(f"{file_name} => No hace falta añadir el historial")
            self.historial_añadido = True
        except Exception as e:
            self.logger.error(f"{file_name} => Error al añadir los mensajes del historial a un thread: {e}")
    
    """
    El agente genera una query SQL para extraer los datos necesarios, o directamente, genera una respuesta según el mensaje del usuario. 
    """
    async def get_response(self, message: str, db_schema: str = "NO DATA", static_tables: dict = {}, history: dict | list[dict] = []) -> Optional[str]:
        try:
            self.logger.debug(f"{file_name} => Iniciando get_response...")
                
            prompt_parts: List[Tuple[str, str | dict | list[dict]]] = [("db_schema.txt", str(db_schema))]
            for table_name, table_data in static_tables.items():
                prompt_parts.append((f"{table_name}.json", table_data))
            
            processed_prompts = await self._process_prompts(prompt_parts, MAX_CHAR_DATA)
            db_schema_prompt = processed_prompts["db_schema.txt"]
            static_tables_prompt = "\n---\n".join(f"{k}\n{v}" for k, v in processed_prompts.items() if k != "db_schema.txt")
            
            self.logger.debug(f"{file_name} => db_schema_prompt: {db_schema_prompt}")
            self.logger.debug(f"{file_name} => static_tables_prompt: {static_tables_prompt}")
            
            prompt = build_prompt(PROMPTS["get_response"], {
                "db_schema": db_schema_prompt, 
                "static_tables": static_tables_prompt,
                "lang": self.lang,
                "limit": self.limit
            })
            
            self.logger.debug(f"{file_name} => attachments: {self.openai_files.files}")
            self.logger.debug(f"{file_name} => attachments vs: {self.vector_store_files.files}")
            self.logger.debug(f"{file_name} => prompt: {prompt}")
            
            # Si alguno de los datos se ha guardado en un fichero se llamara al assistant, sino será una consulta normal
            if any(value.startswith("In the file") for value in processed_prompts.values()):
                await self.continue_thread()
                await self._insert_history_messages_in_thread(history=history)
                await self._add_message_to_thread(message=message, role='user')
                return await self._run_thread(prompt=prompt)
            else:
                messages = build_messages(prompt=prompt, message=message, history=history)
                return await self._call_openai(messages=messages)
        except Exception as e:
            self.logger.exception(f"{file_name} => Error inesperado en get_response: {e}")
            raise
        
    """
    El agente genera una query SQL para extraer los datos necesarios a partir de una query previa debido a la indeterminación o ambigüedad de los datos como podría ser un nombre.
    """
    async def get_query_from_previous_data(self, message: str, db_schema: str = "NO DATA", static_tables: dict = {}, previous_sql="NO DATA", previous_result: list[dict] | Any = "NO DATA", history: dict | list[dict] = []) -> Optional[str]:
        try:
            self.logger.debug(f"{file_name} => Iniciando get_query_from_previous_data...")
            
            # Eliminamos el fichero previous_result por si hay restos
            file_previous_results = self.openai_files.get_file_by_name(name="previous_result.json")
            if file_previous_results:
                await self._delete_file(id=file_previous_results.id, name=file_previous_results.name)
            
            prompt_parts: List[Tuple[str, str | dict | list[dict]]] = [("db_schema.txt", str(db_schema)), ("previous_result.json", previous_result)]
            for table_name, table_data in static_tables.items():
                prompt_parts.append((f"{table_name}.json", table_data))

            # Aqui decidimos si guardar el contenido en un fichero o pasarlo directamente en el prompt
            processed_prompts = await self._process_prompts(prompt_parts, MAX_CHAR_DATA)
            
            db_schema_prompt = processed_prompts["db_schema.txt"]
            previous_result_prompt = processed_prompts["previous_result.json"]
            static_tables_prompt = "\n---\n".join(
                f"{k}\n{v}" for k, v in processed_prompts.items() if k not in {"db_schema.txt", "previous_result.json"}
            )

            prompt = build_prompt(PROMPTS["get_query_from_previous_data"], {
                "db_schema": db_schema_prompt,
                "static_tables": static_tables_prompt, 
                "previous_sql": previous_sql,
                "previous_result": previous_result_prompt,
                "lang": self.lang,
                "limit": self.limit
            })

            # Si alguno de los datos se ha guardado en un fichero se llamara al assistant, sino será una consulta normal
            if any(value.startswith("In the file") for value in processed_prompts.values()):
                await self.continue_thread()
                await self._insert_history_messages_in_thread(history=history)
                await self._add_message_to_thread(message=message, role='user')
                res = await self._run_thread(prompt=prompt)
            else:
                messages = build_messages(prompt=prompt, message=message, history=history)
                res = await self._call_openai(messages=messages)
                
            # Eliminamos el fichero de previous_result
            file_previous_results = self.openai_files.get_file_by_name(name="previous_result.json")
            if file_previous_results:
                await self._delete_file(id=file_previous_results.id, name=file_previous_results.name)
                
            return res
        except Exception as e:
            self.logger.exception(f"{file_name} => Error inesperado en get_query_from_previous_data: {e}")
            raise

    
    """
    El agente genera una respuesta a partir del mensaje del usuario y de los datos obtenidos de la DB.
    """
    async def build_answer_from_query(self, result: list[dict[str, Any]], message: str, db_schema: str = "NO DATA", static_tables: dict = {}, sql_query: str = "NO DATA", history: dict | list[dict] = []) -> Optional[str]:
        try:
            self.logger.debug(f"{file_name} => Iniciando build_answer_from_query...")
            
            # Eliminamos el fichero result por si hay restos
            file_result = self.openai_files.get_file_by_name(name="result.json")
            if file_result:
                await self._delete_file(id=file_result.id, name=file_result.name)
            
            prompt_parts: List[Tuple[str, str | dict | list[dict]]] = [("db_schema.txt", str(db_schema)), ("result.json", result)]
            for table_name, table_data in static_tables.items():
                prompt_parts.append((f"{table_name}.json", table_data))

            processed_prompts = await self._process_prompts(prompt_parts, MAX_CHAR_DATA)
            db_schema_prompt = processed_prompts["db_schema.txt"]
            result_prompt = processed_prompts["result.json"]
            static_tables_prompt = "\n---\n".join(
                f"{k}\n{v}" for k, v in processed_prompts.items() if k not in {"db_schema.txt", "result.json"}
            )

            prompt = build_prompt(PROMPTS["answer_with_data"], {
                "db_schema": db_schema_prompt,
                "static_tables": static_tables_prompt,
                "sql_query": sql_query,
                "result": result_prompt,
                "lang": self.lang,
                "limit": self.limit
            })

            # Si alguno de los datos se ha guardado en un fichero se llamara al assistant, sino será una consulta normal
            if any(value.startswith("In the file") for value in processed_prompts.values()):
                await self.continue_thread()
                await self._insert_history_messages_in_thread(history=history)
                await self._add_message_to_thread(message=message, role='user')
                res = await self._run_thread(prompt=prompt)
            else:
                messages = build_messages(prompt=prompt, message=message, history=history)
                res = await self._call_openai(messages=messages)

            # Eliminamos el fichero result por si hay restos
            file_result = self.openai_files.get_file_by_name(name="result.json")
            if file_result:
                await self._delete_file(id=file_result.id, name=file_result.name)

            try:
                res_json = json.loads(res) if res else {}
                response = res_json.get("response", "")
            except Exception as e:
                response = res
                
            return str(response)
        except Exception as e:
            self.logger.exception(f"{file_name} => Error inesperado en build_answer_from_query: {e}")
            raise

    """
    El agente genera una respuesta a partir del mensaje del usuario sin tener los datos de la DB.
    """
    async def build_answer_without_query(self, message: str, db_schema: str = "NO DATA", static_tables: dict = {}, sql_query: str = "NO DATA", history: dict | list[dict] = []) -> Optional[str]:
        try:
            self.logger.debug(f"{file_name} => Iniciando build_answer_without_query...")
            
            prompt_parts: List[Tuple[str, str | dict | list[dict]]] = [("db_schema.txt", str(db_schema))]
            for table_name, table_data in static_tables.items():
                prompt_parts.append((f"{table_name}.json", table_data))

            processed_prompts = await self._process_prompts(prompt_parts, MAX_CHAR_DATA)
            db_schema_prompt = processed_prompts["db_schema.txt"]
            static_tables_prompt = "\n---\n".join(
                f"{k}\n{v}" for k, v in processed_prompts.items() if k != "db_schema.txt"
            )

            prompt = build_prompt(PROMPTS["answer_without_data"], {
                "db_schema": db_schema_prompt,
                "static_tables": static_tables_prompt,
                "sql_query": sql_query,
                "lang": self.lang,
                "limit": self.limit
            })

            # Si alguno de los datos se ha guardado en un fichero se llamara al assistant, sino será una consulta normal
            if any(value.startswith("In the file") for value in processed_prompts.values()):
                await self.continue_thread()
                await self._insert_history_messages_in_thread(history=history)
                await self._add_message_to_thread(message=message, role='user')
                res = await self._run_thread(prompt=prompt)
            else:
                messages = build_messages(prompt=prompt, message=message, history=history)
                res = await self._call_openai(messages=messages)

            try:
                res_json = json.loads(res) if res else {}
                response = res_json.get("response", "")
            except Exception as e:
                response = res
                
            return str(response)
        except Exception as e:
            self.logger.exception(f"{file_name} => Error inesperado en build_answer_without_query: {e}")
            raise
