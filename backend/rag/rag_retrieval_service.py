"""
RAG Retrieval Service Module

This module provides semantic search and retrieval functionality for journal entries
using embeddings and similarity calculations.

Usage example:
    from rag_retrieval_service import RAGRetrievalService
    
    retrieval_service = RAGRetrievalService(api_base_url="http://your-api.com/api")
    results = retrieval_service.search_similar_entries("What did I write about my trip?", top_k=5)
"""

import requests
import numpy as np
from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingModel
import os
from typing import List, Dict, Any, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGRetrievalService:
    """Service for retrieving and searching journal entries using semantic similarity."""
    
    def __init__(
        self,
        api_base_url: str,
        api_key: str,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
        model_name: Optional[str] = None,
        max_text_length: int = 8000
    ):
        """
        Initialize the RAG Retrieval Service.
        
        Args:
            api_base_url: Base URL of the API (e.g., 'http://api.example.com/api')
            project_id: GCP project ID (defaults to GCP_PROJECT_ID env var)
            location: GCP location (defaults to GCP_LOCATION env var or 'us-central1')
            model_name: Embedding model name (defaults to 'textembedding-gecko@003')
            max_text_length: Maximum text length for embedding generation (default: 8000 chars)
        """
        self.api_base_url = api_base_url.rstrip('/')
        self.api_key = api_key
        self.headers = {"X-API-Key": self.api_key}
        self.project_id = project_id or os.environ.get('GCP_PROJECT_ID', 'your-project-id')
        self.location = location or os.environ.get('GCP_LOCATION', 'us-central1')
        self.model_name = model_name or "text-embedding-005"
        self.max_text_length = max_text_length
        
        # Initialize Vertex AI
        try:
            aiplatform.init(project=self.project_id, location=self.location)
            self.model = TextEmbeddingModel.from_pretrained(self.model_name)
            logger.info(f"RAG Retrieval Service initialized with model: {self.model_name}")
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
    
    def generate_query_embedding(self, query: str) -> List[float]:
        """
        Generate embedding for a search query.
        
        Args:
            query: The search query text
            
        Returns:
            List of float values representing the embedding vector
            
        Raises:
            ValueError: If query is empty
            Exception: If embedding generation fails
        """
        if not query or not query.strip():
            raise ValueError("Query cannot be empty")
        
        try:
            # Truncate if necessary
            truncated_query = self._truncate_text(query)
            
            embeddings = self.model.get_embeddings([truncated_query])
            embedding_values = embeddings[0].values
            logger.info(f"Generated query embedding with dimension: {len(embedding_values)}")
            return embedding_values
        except Exception as e:
            logger.error(f"Query embedding generation failed: {str(e)}")
            raise Exception(f"Query embedding generation failed: {str(e)}")
    
    def get_all_journal_pages(self, journal_id: int, timeout: int = 30) -> List[Dict[str, Any]]:
        """
        Retrieve all pages from a specific journal.
        
        Args:
            journal_id: The ID of the journal
            timeout: Request timeout in seconds (default: 30)
            
        Returns:
            List of journal page dictionaries
            
        Raises:
            Exception: If API request fails
        """
        url = f"{self.api_base_url}/journals/{journal_id}/pages"
        
        try:
            response = requests.get(url, timeout=timeout, headers=self.headers)
            response.raise_for_status()
            
            pages = response.json()
            logger.info(f"Retrieved {len(pages)} pages from journal {journal_id}")
            return pages
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to retrieve pages for journal {journal_id}: {str(e)}")
            raise Exception(f"Failed to retrieve journal pages: {str(e)}")
    
    def get_all_journals(self, timeout: int = 30) -> List[Dict[str, Any]]:
        """
        Retrieve all journals.
        
        Args:
            timeout: Request timeout in seconds (default: 30)
            
        Returns:
            List of journal dictionaries
            
        Raises:
            Exception: If API request fails
        """
        url = f"{self.api_base_url}/journals"
        
        try:
            response = requests.get(url, timeout=timeout, headers=self.headers)
            response.raise_for_status()
            
            journals = response.json()
            logger.info(f"Retrieved {len(journals)} journals")
            return journals
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to retrieve journals: {str(e)}")
            raise Exception(f"Failed to retrieve journals: {str(e)}")
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First embedding vector
            vec2: Second embedding vector
            
        Returns:
            Cosine similarity score (0 to 1)
        """
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    def search_similar_entries(
        self,
        query: str,
        journal_id: Optional[int] = None,
        top_k: int = 5,
        min_similarity: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Search for journal entries similar to the query.
        
        Args:
            query: The search query text
            journal_id: Optional journal ID to limit search to a specific journal
            top_k: Number of top results to return (default: 5)
            min_similarity: Minimum similarity threshold (default: 0.0)
            
        Returns:
            List of dictionaries containing page data and similarity scores, sorted by similarity
            
        Raises:
            ValueError: If query is empty or top_k is invalid
            Exception: If search fails
        """
        if not query or not query.strip():
            raise ValueError("Query cannot be empty")
        
        if top_k <= 0:
            raise ValueError("top_k must be greater than 0")
        
        try:
            # Generate query embedding
            query_embedding = self.generate_query_embedding(query)
            
            # Collect all pages
            all_pages = []
            
            if journal_id is not None:
                # Search in specific journal
                pages = self.get_all_journal_pages(journal_id)
                all_pages.extend(pages)
            else:
                # Search across all journals
                journals = self.get_all_journals()
                for journal in journals:
                    journal_id_from_api = journal.get('id', journal.get('journal_id'))
                    if journal_id_from_api:
                        pages = self.get_all_journal_pages(journal_id_from_api)
                        all_pages.extend(pages)
            
            logger.info(f"Searching through {len(all_pages)} total pages")
            
            # Calculate similarities
            results = []
            for page in all_pages:
                # Check if page has embeddings
                if not page.get('encoding'):
                    logger.warning(f"Page {page.get('id')} has no embeddings, skipping")
                    continue
                
                # Calculate similarity
                similarity = self.cosine_similarity(query_embedding, page['encoding'])
                
                # Filter by minimum similarity
                if similarity >= min_similarity:
                    results.append({
                        'page_id': page.get('id'),
                        'journal_id': page.get('journal_id'),
                        'page_number': page.get('page_number'),
                        'content': page.get('content'),
                        'mood': page.get('mood'),
                        'entry_type': page.get('entry_type'),
                        'created_at': page.get('created_at'),
                        'updated_at': page.get('updated_at'),
                        'similarity_score': similarity
                    })
            
            # Sort by similarity (highest first)
            results.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Return top k results
            top_results = results[:top_k]
            logger.info(f"Returning {len(top_results)} results")
            
            return top_results
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise Exception(f"Search failed: {str(e)}")
    
    def get_context_for_query(
        self,
        query: str,
        journal_id: Optional[int] = None,
        top_k: int = 3,
        min_similarity: float = 0.3
    ) -> str:
        """
        Get relevant context from journal entries for a query (useful for RAG).
        
        Args:
            query: The search query text
            journal_id: Optional journal ID to limit search
            top_k: Number of top results to include (default: 3)
            min_similarity: Minimum similarity threshold (default: 0.3)
            
        Returns:
            Formatted string containing relevant journal entries
        """
        results = self.search_similar_entries(
            query=query,
            journal_id=journal_id,
            top_k=top_k,
            min_similarity=min_similarity
        )
        
        if not results:
            return "No relevant journal entries found."
        
        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(
                f"Entry {i} (similarity: {result['similarity_score']:.2f}):\n"
                f"{result['content']}\n"
            )
        
        return "\n---\n".join(context_parts)