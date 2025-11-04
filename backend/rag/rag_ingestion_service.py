"""
RAG Ingestion Service Module

This module provides document embedding generation using Vertex AI.
Import and use this in your main application to add RAG capabilities.

Usage example:
    from rag_ingestion_service import RAGIngestionService
    
    rag_service = RAGIngestionService()
    embedding = rag_service.generate_embedding("Your journal entry text")
"""

import requests
from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingModel
import os
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGIngestionService:
    """Service for generating embeddings and managing RAG ingestion."""
    
    def __init__(
        self,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
        model_name: Optional[str] = None,
        max_text_length: int = 8000,
        api_key: Optional[str] = None
    ):
        """
        Initialize the RAG Ingestion Service.
        
        Args:
            project_id: GCP project ID (defaults to GCP_PROJECT_ID env var)
            location: GCP location (defaults to GCP_LOCATION env var or 'us-central1')
            model_name: Embedding model name (defaults to 'textembedding-gecko@003')
            max_text_length: Maximum text length for embedding generation (default: 8000 chars)
            api_key: API key for authentication (defaults to API_KEY env var)
        """
        self.project_id = project_id or os.environ.get('GCP_PROJECT_ID', 'your-project-id')
        self.location = location or os.environ.get('GCP_LOCATION', 'us-central1')
        self.model_name = model_name or "textembedding-gecko@003"
        self.max_text_length = max_text_length
        self.api_key = api_key or os.environ.get('API_KEY')
        
        # Initialize Vertex AI
        try:
            aiplatform.init(project=self.project_id, location=self.location)
            self.model = TextEmbeddingModel.from_pretrained(self.model_name)
            logger.info(f"RAG Ingestion Service initialized with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {str(e)}")
            raise
    
    def _truncate_text(self, text: str) -> str:
        """
        Truncate text to maximum length if needed.
        
        Args:
            text: Input text
            
        Returns:
            Truncated text
        """
        if len(text) > self.max_text_length:
            logger.warning(f"Text truncated from {len(text)} to {self.max_text_length} characters")
            return text[:self.max_text_length]
        return text
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for the given text using Vertex AI.
        Automatically truncates text if it exceeds max_text_length.
        
        Args:
            text: The text content to generate an embedding for
            
        Returns:
            List of float values representing the embedding vector
            
        Raises:
            ValueError: If text is empty or None
            Exception: If embedding generation fails
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty or None")
        
        try:
            # Truncate text if necessary
            truncated_text = self._truncate_text(text)
            
            embeddings = self.model.get_embeddings([truncated_text])
            embedding_values = embeddings[0].values
            logger.info(f"Generated embedding with dimension: {len(embedding_values)}")
            return embedding_values
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise Exception(f"Embedding generation failed: {str(e)}")
    
    def prepare_journal_data(
        self,
        page_id: str,
        content: str,
        mood: int,
        entry_type: str
    ) -> Dict[str, Any]:
        """
        Generate embedding and prepare complete journal page data.
        
        Args:
            page_id: Unique identifier for the journal page
            content: Journal entry text content
            mood: Mood value (integer)
            entry_type: Type of journal entry
            
        Returns:
            Dictionary with all fields including the generated embedding
            
        Raises:
            ValueError: If required fields are invalid
            Exception: If embedding generation fails
        """
        # Validate inputs
        if not page_id or not page_id.strip():
            raise ValueError("page_id cannot be empty")
        
        if not content or not content.strip():
            raise ValueError("content cannot be empty")
        
        if not isinstance(mood, int):
            raise ValueError("mood must be an integer")
        
        if not entry_type or not entry_type.strip():
            raise ValueError("entry_type cannot be empty")
        
        # Generate embedding
        embedding = self.generate_embedding(content)
        
        # Prepare complete data package
        journal_data = {
            "content": content,
            "mood": mood,
            "entry_type": entry_type,
            "encoding": embedding
        }
        
        logger.info(f"Prepared journal data for page_id: {page_id}")
        return journal_data
    
    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings produced by the current model.
        
        Returns:
            Integer representing the embedding dimension
        """
        # Generate a sample embedding to determine dimension
        sample_embedding = self.generate_embedding("sample text")
        return len(sample_embedding)


    def update_journal_page_with_embedding(
        self,
        api_base_url: str,
        page_id: str,
        content: str,
        mood: int,
        entry_type: str,
        timeout: int = 30
    ) -> Dict[str, Any]:
        """
        Generate embedding and update journal page via API.
        
        Args:
            api_base_url: Base URL of the API (e.g., 'http://api.example.com/api')
            page_id: Unique identifier for the journal page
            content: Journal entry text content
            mood: Mood value (integer)
            entry_type: Type of journal entry
            timeout: Request timeout in seconds (default: 30)
            
        Returns:
            API response as dictionary
            
        Raises:
            ValueError: If required fields are invalid
            Exception: If API request or embedding generation fails
        """
        # Prepare journal data with embedding
        journal_data = self.prepare_journal_data(page_id, content, mood, entry_type)
        
        # Construct API URL
        url = f"{api_base_url.rstrip('/')}/journal_pages/{page_id}"
        
        try:
            # Send PUT request to API
            response = requests.put(url, json=journal_data, timeout=timeout)
            response.raise_for_status()
            
            logger.info(f"Successfully updated journal page {page_id} via API")
            return response.json()
            
        except requests.exceptions.Timeout:
            logger.error(f"API request timeout for page_id: {page_id}")
            raise Exception(f"API request timed out after {timeout} seconds")
        
        except requests.exceptions.HTTPError as e:
            logger.error(f"API HTTP error for page_id {page_id}: {e.response.status_code}")
            raise Exception(f"API request failed with status {e.response.status_code}: {e.response.text}")
        
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed for page_id {page_id}: {str(e)}")
            raise Exception(f"API request failed: {str(e)}")