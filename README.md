# 🤖 Bot Empresarial con OpenAI / Business Assistant Bot with OpenAI 💬

## 📖 Sobre el proyecto / About

### 🇪🇸 Español
Este proyecto implementa un bot utilizando la API de OpenAI, con la capacidad de conectarse a la base de datos de la empresa **Vismel** para extraer información relevante.  
Gracias a un flujo optimizado de conversaciones y a la generación dinámica de *prompts* personalizados, el bot mantiene siempre el contexto adecuado para responder de forma precisa y coherente a las consultas de los usuarios, convirtiéndose en un asistente empresarial eficiente y confiable.  

### 🇬🇧 English
This project implements a bot powered by the OpenAI API, capable of connecting to **Vismel’s** database to extract relevant information.  
Through an optimized conversational flow and dynamically generated personalized prompts, the bot consistently maintains the right context to provide accurate and coherent responses to user queries, making it an efficient and reliable business assistant.  

---

## 📑 Índice / Table of Contents
- [Características / Features](#-características--features)  
- [Instalación / Installation](#-instalación--installation)  
- [Uso / Usage](#-uso--usage)  
- [Tecnologías / Built-with](#-tecnologías--built-with)
- [Licencia / License](#-licencia--license)  

---

## ✨ Características / Features

### 🇪🇸 Español
- Conexión directa a la base de datos de **Vismel**.  
- Integración con la API de **OpenAI**.  
- Flujo de conversación optimizado.  
- *Prompts* dinámicos y personalizados.  
- Respuestas precisas y contextualizadas.  

### 🇬🇧 English
- Direct connection to **Vismel’s** database.  
- Integration with **OpenAI** API.  
- Optimized conversational flow.  
- Dynamic and personalized prompts.  
- Accurate and contextualized responses.  

---

## ⚙️ Instalación / Installation

### 🇪🇸 Español
#### 0️⃣ Requisitos Previos  
🐳 [Docker](https://docs.docker.com/get-docker/) instalado en tu sistema.  
- 💻 **Linux:**  
    ```bash
    sudo apt update
    sudo apt install docker.io docker-compose -y
    sudo systemctl enable docker
    sudo systemctl start docker
    ```
- 🪟 **Windows/Mac:** descarga e instala [Docker Desktop](https://www.docker.com/products/docker-desktop/).

✅ Verifica que Docker funciona:
```bash
docker --version
docker-compose --version
```

#### 1️⃣ Clona el repositorio 
```bash
git clone https://github.com/mrcl29/ChatbotEmpresarialVismel.git
cd ChatbotEmpresarialVismel
```

#### 2️⃣ Configura las Variables de Entorno Generales  
Copia el template de ```.env``` y configuralo con tus credenciales:
```bash
cp .env.template .env
```
🔑 Variables más importantes a modificar son:
```python
    DB_USER=root
    DB_PASSWORD=admin
    DB_BOT_PASSWORD=some_strong_password_for_bot
    REDIS_PASSWORD=some_strong_pass
    INTERNAL_API_KEY=super_strong_and_secret_mega_password_1234 # Contraseña personalizada para proteger las comunicaciones internas entre módulos
```
> [!WARNING]  
> Se recomienda **NO modificar** el resto de variables para asegurar el buen funcionamiento de la aplicación.

#### 3️⃣ Configura las Variables de Entorno de Node y de Python
- 🟢 NODE:
    ```bash
    cd backend/node
    cp .env.template .env
    ```
    ```python
    # Contraseñas personalizadas para asegurar una autenticación privada en la aplicación
    COOKIE_SECRET=super_coockie_secret
    JWT_SECRET=super_jwt_secret
    ```
- 🐍 PYTHON:
    ```bash
    cd backend/python
    cp .env.template .env
    ```
    ```python
    OPENAI_API_KEY=open_api_key # Tu API Key de OpenAI
    ASSISTANT_ID=assistant_id # No es obigatorio pero se recomienda crear un assistant en OpenAI y adjuntar su ID.
    VECTOR_STORE_ID=vector_store_id # Al igual que el assistant se recomienda crear una base de datos de vectores y adjuntar su ID
    ```

#### 4️⃣ Construye y Levanta los Contenedores
- 🔨 Construcción limpia:
    ```bash
    docker-compose build --no-cache
    docker-compose up
    ```

- 🏃 Para ejecutar en segundo plano:
    ```bash
    docker-compose up --build -d
    ```

- 📜 Usando el ejecutable:
    - **Linux:**
        ```bash
        chmod 777 docker-clean-build.sh
        ./docker-clean-build.sh
        ```
    - **Windows:**
        ```powershell
        Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
        .\docker-clean-build.ps1
        ```

#### 5️⃣ Accede al proyecto
El proyecto estará disponible en:

👉 [localhost:5173](http://localhost:5173/)
> [!IMPORTANT]  
> Debes poner el puerto del Frontend que hayas configurado en el ```.env```.
---
### 🇬🇧 English
#### 0️⃣ Prerequisites  
🐳 [Docker](https://docs.docker.com/get-docker/) installed on your system.  
- 💻 **Linux:**  
    ```bash
    sudo apt update
    sudo apt install docker.io docker-compose -y
    sudo systemctl enable docker
    sudo systemctl start docker
    ```
- 🪟 **Windows/Mac:** download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

✅ Verify Docker is working:
```bash
docker --version
docker-compose --version
```

#### 1️⃣ Clone the repository
```bash
git clone https://github.com/mrcl29/ChatbotEmpresarialVismel.git
cd ChatbotEmpresarialVismel
```

#### 2️⃣ Configure General Environment Variables
Copy the ```.env``` template and set your credentials:
```bash
cp .env.template .env
```
🔑 The most important variables to modify are:
```python
    DB_USER=root
    DB_PASSWORD=admin
    DB_BOT_PASSWORD=some_strong_password_for_bot
    REDIS_PASSWORD=some_strong_pass
    INTERNAL_API_KEY=super_strong_and_secret_mega_password_1234 # Custom password to secure internal communication between modules
```
> [!WARNING]  
> It is recommended **NOT to modify** the rest of the variables to ensure proper application functionality.

#### 3️⃣ Configure Node and Python Environment Variables
- 🟢 NODE:
    ```bash
    cd backend/node
    cp .env.template .env
    ```
    ```python
    # Custom secrets to ensure private authentication in the application
    COOKIE_SECRET=super_coockie_secret
    JWT_SECRET=super_jwt_secret
    ```
- 🐍 PYTHON:
    ```bash
    cd backend/python
    cp .env.template .env
    ```
    ```python
    OPENAI_API_KEY=open_api_key # Your OpenAI API Key
    ASSISTANT_ID=assistant_id # Not mandatory but recommended: create an Assistant in OpenAI and use its ID
    VECTOR_STORE_ID=vector_store_id # Similarly, it is recommended to create a vector database and use its ID
    ```

#### 4️⃣ Build and Start the Containers
- 🔨 Clean build:
    ```bash
    docker-compose build --no-cache
    docker-compose up
    ```

- 🏃 Run in detached mode:
    ```bash
    docker-compose up --build -d
    ```

- 📜 Using the script:
    - **Linux:**
        ```bash
        chmod 777 docker-clean-build.sh
        ./docker-clean-build.sh
        ```
    - **Windows:**
        ```powershell
        Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
        .\docker-clean-build.ps1
        ```

#### 5️⃣ Access the project
El proyecto estará disponible en:

👉 [localhost:5173](http://localhost:5173/)
> [!IMPORTANT]  
> Debes poner el puerto del Frontend que hayas configurado en el ```.env```.
---

## 💻 Uso / Usage

### 🇪🇸 Español

Una vez en ejecución, el bot podrá responder a consultas relacionadas con los datos de la base de datos de **Vismel**, adaptando sus respuestas al contexto y manteniendo una conversación natural.

🔑 **Credenciales para iniciar sesión:**  
- Usuario: `admin`  
- Contraseña: `admin`

### 🇬🇧 English

Once running, the bot will respond to queries related to **Vismel’s** database, adapting its responses to the context and maintaining a natural conversation flow.

🔑 **Login credentials:**  
- Username: `admin`  
- Password: `admin`

## 🛠 Tecnologías / Built-with

- 🟢 [Node.js](https://nodejs.org/)  
- ⚛️ [React](https://reactjs.org/)  
- ⚡ [Vite](https://vitejs.dev/)  
- 🎨 [Tailwind CSS](https://tailwindcss.com/)  
- 🤖 [OpenAI API](https://platform.openai.com/)  
- 🚂 [Express.js](https://expressjs.com/)  
- 🐍 [Python](https://www.python.org/)  
- 🚀 [FastAPI](https://fastapi.tiangolo.com/)  
- 🐳 [Docker](https://www.docker.com/)  
- 🧵 [Redis](https://redis.io/)  
- 💾 [PostgreSQL](https://www.postgresql.org/)

## 📜 Licencia / License

Este proyecto está bajo la licencia MIT.

This project is licensed under the MIT License.
