# backend/python/src/db/database.py
import os
from typing import List, Dict, Any
from sqlalchemy.sql import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from src.logging.logger import base_logger
from src.config.config import STATIC_TABLES

""" VARIABLES GLOBALES """
file_name = os.path.basename(__file__)
""""""""""""""""""""""""""

"""
Objeto que representa una conexion a una DB.
"""
class Database():
    def __init__(self, user, password, host, port, name, schema):
        self.schema = schema
        self.database_url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"
        self.engine = create_async_engine(
            self.database_url,
            pool_size=5,
            max_overflow=10
        )
        self.Session = async_sessionmaker(
            bind=self.engine,
            expire_on_commit=False,
            class_=AsyncSession
        )

    """
    Prueba la conexión a la base de datos.
    Devuelve True si se puede conectar, False si falla.
    """
    async def test_connection(self, logger=base_logger) -> bool:
        try:
            async with self.engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info(f"{file_name} => Conexión exitosa con la base de datos.")
            return True
        except SQLAlchemyError as e:
            logger.error(f"{file_name} => Error de conexión a la base de datos: {e}")
            return False
        except Exception as e:
            logger.exception(f"{file_name} => Error inesperado en test_connection: {e}")
            return False

    """
    Obtiene una descripción completa del esquema de la base de datos,
    incluyendo tablas, descripciones de tablas y sus columnas con tipo de dato y descripción.
    """
    async def get_schema(self, logger=base_logger) -> str | None:
        logger.info(f"{file_name} => Obteniendo esquema de la base de datos: {self.database_url}")
        try:
            async with self.Session() as session:
                statement = text(f"""
                    SELECT
                        c.relname AS table_name,
                        COALESCE(tbl_desc.description, 'Sin descripción') AS table_description,
                        cols.column_name,
                        cols.data_type,
                        COALESCE(col_desc.description, 'Sin descripción') AS column_description
                    FROM
                        pg_class c
                        JOIN pg_namespace n ON n.oid = c.relnamespace
                        LEFT JOIN pg_description tbl_desc
                            ON tbl_desc.objoid = c.oid AND tbl_desc.objsubid = 0
                        JOIN information_schema.columns cols
                            ON cols.table_name = c.relname
                            AND cols.table_schema = n.nspname
                        LEFT JOIN pg_description col_desc
                            ON col_desc.objoid = c.oid AND col_desc.objsubid = cols.ordinal_position
                    WHERE
                        c.relkind = 'r'
                        AND n.nspname = :schema
                    ORDER BY
                        c.relname,
                        cols.ordinal_position;
                """)
                result = await session.execute(statement, {"schema": self.schema})
                rows = result.fetchall()

                logger.info(f"{file_name} => Información del esquema obtenida correctamente.")

                # Agrupar información
                schema_info = {}
                for row in rows:
                    table = row.table_name
                    table_desc = row.table_description
                    column_line = f"{row.column_name} ({row.data_type}): {row.column_description}"
                    schema_info.setdefault((table, table_desc), []).append(column_line)

                # Formatear salida
                output = []
                for (table, description), columns in schema_info.items():
                    output.append(f"Tabla: {table}")
                    output.append(f"Descripción: {description}")
                    output.append("Columnas:")
                    output.extend(f" - {col}" for col in columns)
                    output.append("")

                schema_text = "\n".join(output)
                logger.debug(f"{file_name} => Esquema formateado:\n{schema_text}")
                return schema_text

        except SQLAlchemyError as e:
            logger.error(f"{file_name} => Error de SQLAlchemy al obtener el esquema: {e}")
        except Exception as e:
            logger.exception(f"{file_name} => Error inesperado al obtener el esquema: {e}")

        return None
        
    """
    Obten las tablas estáticas de la base de datos.
    """
    async def get_static_tables(self, logger=base_logger) -> dict:
        logger.info(f"{file_name} => Obteniendo tablas estáticas de la base de datos: {self.database_url}")
        static_tables = {}
        try:
            for table in STATIC_TABLES:
                q = f"SELECT * FROM vismel.{table.strip()};"
                r = await self.query(query=q, logger=logger)
                static_tables[table]=r
        except SQLAlchemyError as e:
            logger.error(f"{file_name} => Error de SQLAlchemy al obtener las tablas estáticas: {e}")
        except Exception as e:
            logger.exception(f"{file_name} => Error inesperado al obtener las tablas estáticas: {e}")
        finally:
            return static_tables

    """
    Ejecuta una query en la DB y devuelve los resultados.
    """
    async def query(self, query: str, logger=base_logger) -> List[Dict[str, Any]] | None:
        logger.info(f"{file_name} => Ejecutando query en la DB: {query}")
        try:
            async with self.Session() as session:
                statement = text(query)
                result = await session.execute(statement)
                data = [dict(row._mapping) for row in result]
                logger.info(f"{file_name} => Consulta ejecutada correctamente.")
                # logger.debug(f"{file_name} => Datos obtenidos:\n{data}")
                return data
        except SQLAlchemyError as e:
            logger.error(f"{file_name} => Error de SQLAlchemy al ejecutar query: {e}")
        except Exception as e:
            logger.exception(f"{file_name} => Error inesperado al ejecutar query: {e}")
        return None

    """
    Cierra la conexión con la DB.
    """
    async def close(self, logger=base_logger) -> None:
        logger.info(f"{file_name} => Cerrando conexión con la base de datos...")
        try:
            await self.engine.dispose()
            logger.info(f"{file_name} => Conexión cerrada exitosamente.")
        except Exception as e:
            logger.exception(f"{file_name} => Error al cerrar la conexión: {e}")