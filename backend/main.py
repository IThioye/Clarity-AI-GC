import os
import uvicorn
import base64
import json
import httpx 
import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()
# GCP Imports
import vertexai
from vertexai.preview.generative_models import GenerativeModel, Part
from vertexai.language_models import TextEmbeddingModel
from google.cloud import speech 

from agent_hub import (
    AGENT_PROMPTS, PROMPT_ORCHESTRATOR, PROMPT_ANALYST, 
    PROMPT_GUIDE, PROMPT_STRATEGIST, PROMPT_ARCHIVIST
)

from tts_service import generate_tts_bytes
from rag.rag_retrieval_service import RAGRetrievalService

# --- GCP Configuration ---
PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
REGION = os.environ.get("GCP_REGION")
AZURE_API_BASE_URL = os.environ.get("AZURE_API_BASE_URL", "https://proxy-clarity.gentleocean-eb3ee6eb.westus2.azurecontainerapps.io/api")
SCHEDULER_TOKEN = os.environ.get("SCHEDULER_TOKEN") 
AZURE_API_KEY = os.environ.get("BDD_API_KEY")
print(f"DEBUG: Project ID={PROJECT_ID}, AZURE_KEY_PRESENT={bool(AZURE_API_KEY)}")
# --- Global Clients ---
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)
gemini_flash = None
embedding_model = None
speech_client = None 
api_client: httpx.AsyncClient = None 
retrieval_service: RAGRetrievalService = None

# --- Pydantic Models for Journal ---
class JournalEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True) 
    id: int
    created_at: datetime
    content: str 
    text_vector: List[float] | None = None 

class JournalResponse(BaseModel):
    entries: List[JournalEntry]

class InsightCreate(BaseModel):
    journal_id: int
    journal_page_id: int | None = None
    summary: str
    sentiment_score: float = 0
    emotion_tags: dict = {}


# --- STARTUP EVENT ---
@app.on_event("startup")
async def startup_event():
    """
    Initialize all GCP clients, the RAG service,
    and the authenticated Azure API client.
    """
    global gemini_flash, embedding_model, api_client, retrieval_service, speech_client
    
    vertexai.init(project=PROJECT_ID, location=REGION)
    gemini_flash = GenerativeModel("gemini-2.5-flash") 
    embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-005")
    speech_client = speech.SpeechClient()

    try:
        # 1. Get the secret key
        if not AZURE_API_KEY:
            raise ValueError("CRITICAL ERROR: BDD_API_KEY environment variable is not set.")
            
        # 2. Create the headers our teammate requires
        headers = {
            "X-API-Key": AZURE_API_KEY,
            "Content-Type": "application/json"
        }
        
        # 3. Initialize the api_client 
        api_client = httpx.AsyncClient(base_url=AZURE_API_BASE_URL, headers=headers)
        
        # 4. Initialize RAG service 
        retrieval_service = RAGRetrievalService(
            api_base_url=AZURE_API_BASE_URL,
            api_key=AZURE_API_KEY,
            project_id=PROJECT_ID,
            location=REGION
        )

        print("GCP clients, Azure API client, and RAG Service initialized successfully.")
        
    except Exception as e:
        print(f"CRITICAL STARTUP ERROR: Failed to init clients: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up the httpx client."""
    if api_client:
        await api_client.aclose()
    print("Azure API client closed.")

@app.post("/v1/transcribe/{user_id}")
async def transcribe_audio(user_id: str, file: UploadFile = File(...)):
    """
    Accepts an audio file, transcribes it, and then runs the
    full agent loop. This is a non-streaming endpoint for voice.
    It will return the FINAL text and audio response.
    """
    print(f"Received audio file from user {user_id}...")
    
    try:
        journal_id = await get_or_create_default_journal(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not get journal: {e}")

    # 1. Transcribe the Audio
    try:
        audio_content = await file.read()
        audio = speech.RecognitionAudio(content=audio_content)
        
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16, 
            sample_rate_hertz=16000,
            language_code="en-US", 
        )

        print("Task 0: Calling Speech-to-Text API...")
        response = speech_client.recognize(config=config, audio=audio)
        
        if not response.results or not response.results[0].alternatives:
            raise HTTPException(status_code=400, detail="Could not transcribe audio.")
            
        raw_text = response.results[0].alternatives[0].transcript
        print(f"Transcription complete: '{raw_text}'")

    except Exception as e:
        print(f"Speech-to-Text failed: {e}")
        raise HTTPException(status_code=500, detail="Speech-to-Text failed.")    
    # 2. EMBED
    print("Task 1: Generating vector...")
    embeddings = embedding_model.get_embeddings([raw_text])
    vector = embeddings[0].values

    # 3. STORE
    print("Task 2: Storing in journal_pages via API...")
    page_payload = { 
        "journal_id": journal_id, 
        "content": raw_text, 
        "encoding": "utf-8", 
        "entry_type": "voice", 
        "text_vector": vector 
    }
    try:
        # We don't wait for this, just fire it off
        asyncio.create_task(
            api_client.post(f"/journals/{journal_id}/pages", json=page_payload)
        )
    except httpx.HTTPStatusError as e:
        print(f"Warning: Failed to save journal page to Azure: {e}")
    
    # 4. ORCHESTRATE
    print("Task 3: Calling Orchestrator...")
    orchestrator_prompt = f"{PROMPT_ORCHESTRATOR}\n<new_entry>{raw_text}</new_entry>"
    orchestrator_response = await gemini_flash.generate_content_async([orchestrator_prompt])
    try:
        decision = json.loads(orchestrator_response.text)
        route = decision.get("route", "NONE")
    except Exception:
        route = "NONE"
    print(f"Orchestrator decision: {route}")

    # 5. ROUTE (Handle "NONE" case)
    if route == "NONE":
        # We still return the transcribed text so the app can show it
        return {"type": "ACK", "status": "saved_and_processed", "text": raw_text}

    # 6. RAG
    print("Task 4: Running RAG (calling Azure API)...")
    history = "No relevant history found."
    if route in ["Analyst", "Strategist", "Archivist", "Guide"]:
        plaintext_context = await get_relevant_entries_from_db(journal_id, raw_text) 
        if plaintext_context:
            history = "\n---\n".join(plaintext_context)
    
    # 7. SPECIALIST AGENT
    print(f"Task 5: Calling Specialist Agent: {route}")
    specialist_prompt_template = AGENT_PROMPTS.get(route)
    full_prompt = f"""
    <system_instructions>{specialist_prompt_template}</system_instructions>
    <history>{history}</history>
    <new_entry>{raw_text}</new_entry>
    Provide your agentic response:
    """
    
    # 8. GET FULL (NON-STREAMING) RESPONSE
    print("Task 6: Getting full response...")
    response = await gemini_flash.generate_content_async([full_prompt])
    full_text_response = response.text
    
    # 9. TTS
    print("Task 7: Generating TTS...")
    audio_bytes = generate_tts_bytes(full_text_response)
    audio_base64 = None
    if audio_bytes:
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
    else:
        print("TTS generation failed.")

    # 10. RETURN EVERYTHING AT ONCE
    return {
        "type": "AGENT_RESPONSE",
        "text": full_text_response,
        "audio": audio_base64
    }

async def get_or_create_default_journal(user_id: str) -> int:
    """
    Finds the user's 'Default Journal' by CALLING THE AZURE API.
    If it doesn't exist, this creates it.
    """
    try:
        # 1. Check if journal exists
        response = await api_client.get(f"/journals?user_id={user_id}")
        response.raise_for_status() # Raise error on 4xx/5xx
        journals = response.json()
        
        for journal in journals:
            if journal['title'] == 'Default Journal':
                return journal['id']
        
        # 2. It doesn't exist, so create it
        print(f"Creating 'Default Journal' for user {user_id} via API...")
        
        create_payload = {"user_id": int(user_id), "title": "Default Journal"} 
        
        response = await api_client.post("/journals", json=create_payload)
        response.raise_for_status()
        new_journal = response.json()
        return new_journal['id']
        
    except httpx.HTTPStatusError as e:
        print(f"Error communicating with Azure API: {e.response.text}")
        raise 
    except ValueError:
        print(f"ERROR: The user_id '{user_id}' is not a valid integer. Cannot create journal.")
        raise
    except Exception as e:
        print(f"An unknown error occurred in get_or_create_default_journal: {e}")
        raise

# --- RAG FUNCTION ---
async def get_relevant_entries_from_db(journal_id: int, query_text: str) -> List[str]:
    """
    Performs a server-side RAG query using the RAGRetrievalService.
    Wraps the synchronous search_similar_entries in an async executor
    to prevent blocking the server.
    """
    try:
        results = await asyncio.to_thread(
            retrieval_service.search_similar_entries,
            query=query_text,
            journal_id=journal_id,
            top_k=10, 		
            min_similarity=0.3 
        )
        return [result['content'] for result in results]
    
    except Exception as e:
        print(f"RAG search failed: {e}")
        return []

# --- WEBSOCKET ENDPOINT 	---
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    
    try:
        journal_id = await get_or_create_default_journal(user_id)
        print(f"User {user_id} connected. Writing to journal_id {journal_id}.")
    except Exception as e:
        print(f"CRITICAL API ERROR: Could not get journal for user {user_id}. {e}")
        await websocket.close(code=1011)
        return

    try:
        while True:
            data_json = await websocket.receive_json()
            
            if data_json.get("type") == "NEW_ENTRY":
                payload = data_json["payload"]
                raw_text = payload["raw_text"]

                print("Task 1: Generating vector...")
                embeddings = embedding_model.get_embeddings([raw_text])
                vector = embeddings[0].values

                print("Task 2: Storing in journal_pages via API...")
                page_payload = {
                    "journal_id": journal_id,
                    "content": raw_text,
                    "encoding": "utf-8",
                    "entry_type": "text",
                    "text_vector": vector 
                }
                try:
                    # Fire-and-forget save
                    asyncio.create_task(
                        api_client.post(f"/journals/{journal_id}/pages", json=page_payload)
                    )
                except httpx.HTTPStatusError as e:
                    print(f"Warning: Failed to save journal page to Azure: {e}")
                
                print("Task 3: Calling Orchestrator...")
                orchestrator_prompt = f"{PROMPT_ORCHESTRATOR}\n<new_entry>{raw_text}</new_entry>"
                orchestrator_response = await gemini_flash.generate_content_async([orchestrator_prompt])
                try:
                    decision = json.loads(orchestrator_response.text)
                    route = decision.get("route", "NONE")
                except Exception:
                    route = "NONE"
                print(f"Orchestrator decision: {route}")

                if route == "NONE":
                    await websocket.send_json({"type": "ACK", "status": "saved_and_processed"})
                    continue 

                print("Task 4: Running RAG (calling Azure API)...")
                history = "No relevant history found."
                if route in ["Analyst", "Strategist", "Archivist", "Guide"]:
                    plaintext_context = await get_relevant_entries_from_db(journal_id, raw_text) 
                    if plaintext_context:
                        history = "\n---\n".join(plaintext_context)
                
                print(f"Task 5: Calling Specialist Agent: {route}")
                specialist_prompt_template = AGENT_PROMPTS.get(route)
                full_prompt = f"""
                <system_instructions>{specialist_prompt_template}</system_instructions>
                <history>{history}</history>
                <new_entry>{raw_text}</new_entry>
                Provide your agentic response:
                """
                
                print("Task 6: Streaming response...")
                stream = await gemini_flash.generate_content_async([full_prompt], stream=True)
                full_text_response = ""
                async for chunk in stream:
                    token = chunk.text
                    full_text_response += token
                    await websocket.send_json({"type": "TOKEN", "payload": token})
                
                print("Task 7: Generating TTS...")
                audio_bytes = generate_tts_bytes(full_text_response)
                
                if audio_bytes:
                    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                    await websocket.send_json({"type": "AUDIO", "payload": audio_base64})
                else:
                    print("TTS generation failed.")

    except WebSocketDisconnect:
        print(f"Client {user_id} disconnected.")
    except Exception as e:
        print(f"An error occurred in websocket: {e}")

# --- SCHEDULED ANALYST ENDPOINT ---
@app.post("/run-longitudinal-analysis/{user_id}")
async def run_longitudinal_analysis(user_id: str, request: Request):
    token = request.headers.get("X-Scheduler-Token")
    if token != SCHEDULER_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    try:
        journal_id = await get_or_create_default_journal(user_id)
    except Exception as e:
        return {"status": "error", "detail": f"Could not find user/journal: {e}"}

    print(f"Task 1: Starting longitudinal analysis for user {user_id} (journal_id {journal_id})...")
    
    try:
        response = await api_client.get(f"/journals/{journal_id}/pages")
        response.raise_for_status()
        pages = response.json()
        entries = [page['content'] for page in pages]
    except httpx.HTTPStatusError as e:
        return {"status": "error", "detail": f"Failed to fetch history: {e}"}

    if not entries:
        return {"status": "success", "detail": "No new entries"}

    full_transcript = "\n---\n".join(entries)

    print("Task 2: Calling Analyst agent...")
    analysis_request = "Please analyze my entries from the past week and provide one single, profound insight..."
    full_prompt = f"""
    <system_instructions>{PROMPT_ANALYST}</system_instructions>
    <history>{full_transcript}</history>
    <new_entry>{analysis_request}</new_entry>
    Provide your agentic response:
    """
    response = await gemini_flash.generate_content_async([full_prompt])
    insight_text = response.text

    print("Task 3: Saving new insight to database via API...")
    insight_payload: InsightCreate = {
        "journal_id": journal_id,
        "summary": insight_text,
        "sentiment_score": 0, 
        "emotion_tags": {}
    }
    try:
        await api_client.post("/insights", json=insight_payload)
    except httpx.HTTPStatusError as e:
        return {"status": "error", "detail": f"Failed to save insight: {e}"}
    
    return {"status": "success", "insight_generated": insight_text[:50] + "..."}

# --- JOURNAL BROWSER ENDPOINT ---
@app.get("/v1/journal/{user_id}", response_model=JournalResponse)
async def get_journal_entries(user_id: str):
    try:
        journal_id = await get_or_create_default_journal(user_id)
    except Exception:
        return JournalResponse(entries=[])

    print(f"Fetching journal history for user {user_id} (journal_id {journal_id})...")
    
    try:
        response = await api_client.get(f"/journals/{journal_id}/pages")
        response.raise_for_status()
        pages = response.json()
        
        sorted_pages = sorted(pages, key=lambda x: x['created_at'], reverse=True)
        entries = [JournalEntry(**row) for row in sorted_pages]
        return JournalResponse(entries=entries)
    except httpx.HTTPStatusError as e:
        return JournalResponse(entries=[])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))