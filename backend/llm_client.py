"""
Ollama LLM client with streaming support
"""

import os
import httpx
import multiprocessing
from typing import AsyncIterator, Optional, List, Dict, Any


class OllamaClient:
    """
    Client for interacting with Ollama LLM API with streaming support.
    """
    
    def __init__(self):
        """Initialize Ollama client"""
        self.ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.default_model = os.getenv("OLLAMA_MODEL", "llama2")
    
    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[str]:
        """
        Stream chat completion from Ollama.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (optional, uses default)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Yields:
            Text chunks as they arrive from Ollama
        """
        model = model or self.default_model
        
        # Performance optimizations
        num_thread = int(os.getenv("OLLAMA_NUM_THREAD", multiprocessing.cpu_count()))
        num_ctx = int(os.getenv("OLLAMA_NUM_CTX", 2048))  # Context window (reduce for faster responses)
        num_gpu = int(os.getenv("OLLAMA_NUM_GPU", 0))  # GPU layers (0 = CPU only)
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                # Use /api/chat endpoint for proper message handling
                async with client.stream(
                    "POST",
                    f"{self.ollama_url}/api/chat",
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": True,
                        "options": {
                            "temperature": temperature,
                            "num_thread": num_thread,  # CPU threads for inference
                            "num_ctx": num_ctx,  # Context window size
                            "num_gpu": num_gpu,  # GPU layers (0 = CPU, -1 = all layers on GPU)
                            **({"num_predict": max_tokens} if max_tokens else {})
                        }
                    }
                ) as response:
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        
                        try:
                            import json
                            data = json.loads(line)
                            
                            # Extract content from response
                            if "message" in data and "content" in data["message"]:
                                content = data["message"]["content"]
                                if content:
                                    yield content
                            
                            # Check if done
                            if data.get("done", False):
                                break
                        except json.JSONDecodeError:
                            # Skip invalid JSON lines
                            continue
                            
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise ValueError(
                        f"Ollama model '{model}' not found. "
                        f"Please pull it first: ollama pull {model}"
                    )
                raise ValueError(f"Ollama API error ({e.response.status_code}): {str(e)}")
            except httpx.RequestError as e:
                raise ValueError(f"Failed to connect to Ollama at {self.ollama_url}: {str(e)}")
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Get non-streaming chat completion from Ollama.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (optional, uses default)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Complete response text
        """
        model = model or self.default_model
        
        # Performance optimizations
        num_thread = int(os.getenv("OLLAMA_NUM_THREAD", multiprocessing.cpu_count()))
        num_ctx = int(os.getenv("OLLAMA_NUM_CTX", 2048))
        num_gpu = int(os.getenv("OLLAMA_NUM_GPU", 0))
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                response = await client.post(
                    f"{self.ollama_url}/api/chat",
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_thread": num_thread,
                            "num_ctx": num_ctx,
                            "num_gpu": num_gpu,
                            **({"num_predict": max_tokens} if max_tokens else {})
                        }
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "").strip()
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise ValueError(
                        f"Ollama model '{model}' not found. "
                        f"Please pull it first: ollama pull {model}"
                    )
                raise ValueError(f"Ollama API error ({e.response.status_code}): {str(e)}")
            except httpx.RequestError as e:
                raise ValueError(f"Failed to connect to Ollama at {self.ollama_url}: {str(e)}")
    
    async def check_model_available(self, model: Optional[str] = None) -> bool:
        """
        Check if the specified model is available in Ollama.
        
        Args:
            model: Model name (optional, uses default)
            
        Returns:
            True if model is available, False otherwise
        """
        model = model or self.default_model
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    model_names = [m.get("name", "") for m in models]
                    return model in model_names
                return False
        except:
            return False

