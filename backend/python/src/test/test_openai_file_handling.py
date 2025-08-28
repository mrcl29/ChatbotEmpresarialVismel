import os
import asyncio
import json
import tempfile
from src.config.config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SCHEMA, OPENAI_API_KEY, INTERNAL_API_KEY
from src.db.database import Database
from openai import AsyncOpenAI

db = Database(user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, name=DB_NAME, schema=DB_SCHEMA)
api_key =OPENAI_API_KEY
MODEL = "gpt-4o"

async def main():
    db_schema = await db.get_schema()
    results = await db.query("SELECT * FROM vismel.usuario;")
    # print(type(db_schema))
    # print(db_schema)
    # print("..................")
    # print(type(json.dumps(db_schema, indent=2, ensure_ascii=False)))
    # print(json.dumps(db_schema, indent=2, ensure_ascii=False))
    # print("..................")
    # print(type(results))
    # print(results)
    # print("..................")
    # print(type(json.dumps(results, indent=2, ensure_ascii=False)))
    # print(json.dumps(results, indent=2, ensure_ascii=False))
    client = AsyncOpenAI(api_key=api_key)

    # 1. Crear archivo temporal
    sample_data = {
        "clientes": [
            {"id": 1, "nombre": "Ana", "saldo": 1500.50},
            {"id": 2, "nombre": "Luis", "saldo": 3200.00},
            {"id": 3, "nombre": "Clara", "saldo": -50.25}
        ]
    }
    with tempfile.NamedTemporaryFile(mode="w+", suffix=".json", delete=False) as tmp:
        json.dump(sample_data, tmp)
        tmp_path = tmp.name

    # 2. Subir archivo
    print("Subiendo archivo...")
    file = await client.files.create(file=open(tmp_path, "rb"), purpose="assistants")
    print(f"Archivo subido: {file.id}")
    
    files = await client.files.list()
    print(files)
    print(files.data)
    for d in files.data:
        print(d)
        print(d.id)
        print(d.filename)

    # 3. Crear Assistant (solo una vez)
    print("Creando Assistant...")
    assistant = await client.beta.assistants.create(
        name="AsistenteTest",
        model=MODEL,
        tools=[{"type": "file_search"}]
    )
    print(assistant.id)

    # # 4. Crear Thread con archivo adjunto
    # print("Creando thread con archivo adjunto...")
    # thread = await client.beta.threads.create(
    #     messages=[
    #         {
    #             "role": "user",
    #             "content": "¿Qué cliente tiene el mayor saldo?",
    #             "attachments": [
    #                 {
    #                     "file_id": file.id,
    #                     "tools": [{"type": "file_search"}]
    #                 }
    #             ]
    #         }
    #     ]
    # )

    # # 5. Ejecutar Assistant
    # print("Lanzando ejecución del Assistant...")
    # run = await client.beta.threads.runs.create_and_poll(
    #     thread_id=thread.id,
    #     assistant_id=assistant.id
    # )

    # # 6. Obtener respuesta
    # messages = await client.beta.threads.messages.list(thread_id=thread.id)
    # print(messages)
    # respuesta = messages.data[0].content[0].text.value

    # print("\n📣 Respuesta del modelo:")
    # print(respuesta)

    # 7. Limpieza
    print("\n🧹 Limpiando recursos...")
    await client.files.delete(file.id)
    # await client.beta.assistants.delete(assistant.id)
    os.remove(tmp_path)

if __name__ == "__main__":
    asyncio.run(main())
