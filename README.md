# ClarityAI 🧠✨

ClarityAI is a full-stack generative AI journaling application. It provides a private, reflective space for users to record their thoughts via text or voice and receive context-aware, empathetic support from an advanced AI assistant.

The system is built on a modern microservices architecture, separating the user-facing application from the complex AI and data-processing backend.

---

## Architecture Overview

The project is a monorepo containing two distinct services:

### 1. Frontend (Next.js)

A modern, responsive web application built with **Next.js, React, and TypeScript**.

* **UI:** Styled with **Tailwind CSS** for a clean, responsive layout.
* **State Management:** Uses **Zustand** for lightweight global state (chat, auth, etc.).
* **Features:**
    * **Journal:** Real-time chat interface for interacting with the AI.
    * **Dashboard:** Visualizations for mood tracking and journal statistics.
    * **Archive:** Browse past conversations and entries.
    * **Voice Input:** In-browser speech-to-text for journal entries.

### 2. Backend (FastAPI)

A powerful AI agent hub built with **Python and FastAPI**.

* **Real-time Chat:** Manages persistent user connections via **WebSockets** for streaming AI responses.
* **AI Agent System:**
    * **Orchestrator:** A central agent that analyzes user input and routes tasks to the appropriate specialist agent (e.g., Guide, Analyst) or decides not to respond.
    * **Specialist Agents:** A team of agents (like `PROMPT_GUIDE`, `PROMPT_ANALYST`) each with a unique role, prompt, and access to memory.
* **Generative AI:** Uses **Google Vertex AI** (Gemini models) for all reasoning and text generation.
* **Memory (RAG):** Features a built-in RAG (Retrieval-Augmented Generation) system. It generates embeddings (using Google's Text Embedding Models) for each journal entry and retrieves relevant past entries from the database to provide context to the AI agents.
* **Services:**
    * **Speech-to-Text:** Uses Google Cloud Speech-to-Text for voice transcriptions.
    * **Text-to-Speech:** Uses Google Cloud Text-to-Speech to generate audio responses.
* **Database:** Connects to an external REST API (hosted on Azure) to securely store and retrieve all user journal data and vector embeddings.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, Next.js, TypeScript, Tailwind CSS, Zustand |
| **Backend** | Python, FastAPI, Uvicorn, Gunicorn |
| **Real-time** | WebSockets |
| **GenAI** | Google Vertex AI (Gemini & Text Embedding Models) |
| **AI Services** | Google Cloud Speech-to-Text, Google Cloud Text-to-Speech |
| **Database** | External REST API (Azure) |
| **Deployment** | Docker, Google Cloud Run |

---

## 🏃‍♂️ Running Locally

To run the full application locally, you must run both servers simultaneously in two separate terminals.

### Prerequisites

1.  **Python 3.10+** and `pip`.
2.  **Node.js 18+** and `npm`.
3.  **Google Cloud Credentials:**
    * A Google Cloud project with Vertex AI, Speech-to-Text, and Text-to-Speech APIs enabled.
    * A GCP Service Account JSON key file.

### Terminal 1: Run the Backend (Port 8080)

1.  **Navigate to the backend:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    
    # On Windows (PowerShell)
    # If you get an error, run this first: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    .\venv\Scripts\activate
    
    # On Mac/Linux
    source venv/bin/activate
    ```
3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Create your environment file:**
    Create a file named `.env` in the `backend/` directory.

    **`backend/.env`**
    ```env
    # Path to your GCP service account key
    GOOGLE_APPLICATION_CREDENTIALS=gcp-key.json
    
    # Your GCP project details
    GCP_PROJECT_ID=clarity-ai-hackathon
    GCP_REGION=europe-west9
    
    # Your Azure API secrets
    AZURE_API_BASE_URL=[https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/api](https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/api)
    BDD_API_KEY=YOUR_AZURE_API_KEY_HERE
    SCHEDULER_TOKEN=YOUR_SCHEDULER_TOKEN_HERE
    ```
    *Note: Make sure to add `from dotenv import load_dotenv` and `load_dotenv()` to the top of `backend/main.py`.*

5.  **Run the backend server:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8080
    ```
    *Leave this terminal running.*

### Terminal 2: Run the Frontend (Port 3000)

1.  **Open a new terminal** and navigate to the frontend:
    ```bash
    cd frontend
    ```
2.  **Install Node dependencies:**
    ```bash
    npm install
    ```
3.  **Create your local environment file:**
    Create a file named `.env.local` in the `frontend/` directory.

    **`frontend/.env.local`**
    ```env
    # This URL points to your LOCAL backend server from Terminal 1
    NEXT_PUBLIC_GCP_AGENT_URL=http://localhost:8080
    
    # This URL points to the REAL Azure database proxy
    NEXT_PUBLIC_AZURE_API_URL=[https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/api](https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/api)
    ```
4.  **Run the frontend server:**
    ```bash
    npm run dev
    ```
    *Leave this terminal running.*

### Access the Application

Your application is now running!
* **Access the Frontend:** `http://localhost:3000`
* **Access the Backend Docs:** `http://localhost:8080/docs`

---

## 🚀 Deployment (Google Cloud Run)

This project is configured for a multi-service deployment on Google Cloud Run.

1.  **Service 1: Backend (Agent)**
    * Deploy the `backend/` directory to a Cloud Run service (e.g., `clarity-agent-service`).
    * **Crucially**, you must inject all your secrets (`BDD_API_KEY`, `GCP_PROJECT_ID`, etc.) as **Environment Variables** in the Cloud Run service, mapping them from Secret Manager.
    * Note the **HTTPS URL** of this deployed service.

2.  **Service 2: Frontend (Web)**
    * Deploy the `frontend/` directory to a second Cloud Run service (e.g., `clarity-frontend-service`).
    * In this service's **Environment Variables**, set the following:
        * `NEXT_PUBLIC_GCP_AGENT_URL`: The HTTPS URL of your deployed backend (Service 1).
        * `NEXT_PUBLIC_AZURE_API_URL`: The production URL for your Azure API.