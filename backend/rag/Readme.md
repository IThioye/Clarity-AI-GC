# RAG Services Documentation

Two Python modules for implementing Retrieval-Augmented Generation (RAG) functionality in journal applications using Vertex AI embeddings.

---

## `rag_ingestion_service.py`

### Description
Generates embeddings for journal entries using Google Vertex AI and updates them via your API. Handles text truncation for long entries automatically.

### Requirements
```bash
pip install google-cloud-aiplatform requests
```

### Environment Variables
```bash
export GCP_PROJECT_ID="your-gcp-project-id"
export GCP_LOCATION="us-central1"  # Optional, defaults to us-central1
export API_KEY="your-api-key"      # Optional
```

### Main Functions

#### 1. Initialize the Service
```python
from rag_ingestion_service import RAGIngestionService

service = RAGIngestionService(
    api_key="your-api-key",      # Optional
    max_text_length=8000         # Optional, default 8000
)
```

#### 2. Generate Embedding Only
```python
embedding = service.generate_embedding("Your journal entry text here")
# Returns: List[float] - embedding vector
```

#### 3. Generate Embedding and Update API (Recommended)
```python
response = service.update_journal_page_with_embedding(
    api_base_url="http://your-api.com/api",
    page_id="123",
    content="Today I went to the beach...",
    mood=8,
    entry_type="daily"
)
# Returns: API response dict
```

### Usage Example in Main App
```python
from rag_ingestion_service import RAGIngestionService

# Initialize once at startup
rag_service = RAGIngestionService()

# In your journal creation/update endpoint
@app.post('/create-entry')
def create_entry():
    data = request.json
    
    try:
        # Automatically generates embedding and updates via API
        api_response = rag_service.update_journal_page_with_embedding(
            api_base_url="http://your-api.com/api",
            page_id=data['page_id'],
            content=data['content'],
            mood=data['mood'],
            entry_type=data['entry_type']
        )
        return {"success": True, "response": api_response}
    except Exception as e:
        return {"error": str(e)}, 500
```

---

## `rag_retrieval_service.py`

### Description
Performs semantic search across journal entries using cosine similarity. Retrieves relevant entries based on query embeddings.

### Requirements
```bash
pip install google-cloud-aiplatform requests numpy
```

### Environment Variables
Same as ingestion service.

### Main Functions

#### 1. Initialize the Service
```python
from rag_retrieval_service import RAGRetrievalService

service = RAGRetrievalService(
    api_base_url="http://your-api.com/api",
    api_key="your-api-key",      # Optional
    max_text_length=8000         # Optional
)
```

#### 2. Search Similar Entries
```python
results = service.search_similar_entries(
    query="What did I write about my vacation?",
    journal_id=None,             # Optional: limit to specific journal
    top_k=5,                     # Number of results
    min_similarity=0.3           # Minimum similarity threshold (0-1)
)

# Returns list of dicts with:
# - page_id, journal_id, content, mood, entry_type
# - similarity_score (0-1, higher is more similar)
```

#### 3. Get Formatted Context (for RAG)
```python
context = service.get_context_for_query(
    query="Tell me about my trip memories",
    top_k=3,
    min_similarity=0.3
)
# Returns: Formatted string with relevant entries
```

### Usage Example in Main App
```python
from rag_retrieval_service import RAGRetrievalService

# Initialize once at startup
retrieval_service = RAGRetrievalService(
    api_base_url="http://your-api.com/api"
)

# In your search endpoint
@app.get('/search')
def search_entries():
    query = request.args.get('query')
    
    try:
        results = retrieval_service.search_similar_entries(
            query=query,
            top_k=5,
            min_similarity=0.3
        )
        
        return {
            "query": query,
            "results": results
        }
    except Exception as e:
        return {"error": str(e)}, 500

# In your chatbot/RAG endpoint
@app.post('/ask')
def ask_question():
    question = request.json['question']
    
    # Get relevant context from journal entries
    context = retrieval_service.get_context_for_query(
        query=question,
        top_k=3
    )
    
    # Use context with your LLM (Claude, GPT, etc.)
    prompt = f"Based on these journal entries:\n{context}\n\nQuestion: {question}"
    # ... send to LLM and return response
```

---

## API Requirements

Your API should support:

### For Ingestion:
```
PUT /api/journal_pages/{page_id}
Body: {
  "content": "string",
  "mood": 0,
  "entry_type": "string",
  "embedding": [0.123, 0.456, ...]  # Added by service
}
```

### For Retrieval:
```
GET /api/journals
Returns: [{"id": 1, ...}, ...]

GET /api/journals/{journal_id}/pages
Returns: [{
  "id": 0,
  "journal_id": 0,
  "content": "string",
  "mood": 0,
  "entry_type": "string",
  "embeddings": [0.123, 0.456, ...],
  "created_at": "2025-11-01T14:06:14.965Z"
}, ...]
```

---

## Quick Start

```python
from rag_ingestion_service import RAGIngestionService
from rag_retrieval_service import RAGRetrievalService

# Initialize both services
ingestion = RAGIngestionService()
retrieval = RAGRetrievalService(api_base_url="http://your-api.com/api")

# Create entry with embedding
ingestion.update_journal_page_with_embedding(
    api_base_url="http://your-api.com/api",
    page_id="1",
    content="Amazing day at the beach!",
    mood=9,
    entry_type="daily"
)

# Search for similar entries
results = retrieval.search_similar_entries(
    query="beach memories",
    top_k=3
)

for result in results:
    print(f"Score: {result['similarity_score']:.2f} - {result['content']}")
```