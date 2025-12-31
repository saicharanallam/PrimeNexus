"""
LLM Provider Abstraction
Supports both OpenAI and Ollama (open-source) providers
"""

import os
import asyncio
import httpx
from typing import Dict, Any, Optional, Literal
from enum import Enum


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    OLLAMA = "ollama"
    AUTO = "auto"  # Auto-detect based on available services


class LLMClient:
    """
    Unified LLM client that supports both OpenAI and Ollama.
    Automatically falls back to Ollama if OpenAI is not configured.
    """
    
    def __init__(self, provider: str = "auto"):
        """
        Initialize LLM client.
        
        Args:
            provider: "openai", "ollama", or "auto" (default)
        """
        self.provider_type = provider
        self.openai_client = None
        self.ollama_url = os.getenv("OLLAMA_URL", "http://ollama:11434")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama2")
        self.vision_model = os.getenv("OLLAMA_VISION_MODEL", "llava")
        
        # Determine which provider to use
        if provider == "auto":
            openai_key = os.getenv("OPENAI_API_KEY")
            if openai_key:
                try:
                    from openai import OpenAI
                    self.openai_client = OpenAI(api_key=openai_key)
                    self.provider_type = "openai"
                    print("Using OpenAI provider")
                except Exception as e:
                    print(f"Failed to initialize OpenAI, falling back to Ollama: {e}")
                    self.provider_type = "ollama"
            else:
                self.provider_type = "ollama"
                print("No OpenAI API key found, using Ollama provider")
        else:
            self.provider_type = provider
        
        if self.provider_type == "openai" and not self.openai_client:
            openai_key = os.getenv("OPENAI_API_KEY")
            if not openai_key:
                raise ValueError("OPENAI_API_KEY required when using OpenAI provider")
            from openai import OpenAI
            self.openai_client = OpenAI(api_key=openai_key)
    
    async def check_model_available(self, model: Optional[str] = None) -> bool:
        """
        Check if the specified model is available in Ollama.
        
        Args:
            model: Model name (optional, uses default)
            
        Returns:
            True if model is available, False otherwise
        """
        if self.provider_type != "ollama":
            return True  # Not applicable for OpenAI
        
        model = model or self.ollama_model
        
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
    
    async def chat_completion(
        self,
        messages: list,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """
        Get chat completion from LLM.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (optional, uses default for provider)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text response
        """
        if self.provider_type == "openai":
            return await self._openai_chat(messages, model, temperature, max_tokens)
        else:
            return await self._ollama_chat(messages, model, temperature, max_tokens)
    
    async def _openai_chat(
        self,
        messages: list,
        model: Optional[str],
        temperature: float,
        max_tokens: int
    ) -> str:
        """OpenAI chat completion"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")
        
        model = model or "gpt-4"
        loop = asyncio.get_event_loop()
        
        def make_call():
            return self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
        
        response = await loop.run_in_executor(None, make_call)
        
        if not response or not response.choices:
            raise ValueError("OpenAI API returned empty response")
        
        return response.choices[0].message.content.strip()
    
    async def _ollama_chat(
        self,
        messages: list,
        model: Optional[str],
        temperature: float,
        max_tokens: int
    ) -> str:
        """Ollama chat completion - uses /api/generate for compatibility"""
        model = model or self.ollama_model
        
        # Convert messages to a single prompt string
        # Combine system and user messages into a single prompt
        prompt_parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                prompt_parts.append(f"System: {content}")
            elif role == "user":
                prompt_parts.append(f"User: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}")
        
        prompt = "\n\n".join(prompt_parts)
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                # First, try /api/generate (more compatible)
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    }
                )
                response.raise_for_status()
                data = response.json()
                result = data.get("response", "").strip()
                
                if result:
                    return result
                
                # If empty, try /api/chat as fallback
                ollama_messages = []
                for msg in messages:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    if role in ["system", "user", "assistant"]:
                        ollama_messages.append({
                            "role": role,
                            "content": content
                        })
                
                response = await client.post(
                    f"{self.ollama_url}/api/chat",
                    json={
                        "model": model,
                        "messages": ollama_messages,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "").strip()
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    # Model might not be loaded
                    raise ValueError(
                        f"Ollama model '{model}' not found. "
                        f"Please pull it first: docker exec sigmachain-ollama ollama pull {model}"
                    )
                raise ValueError(f"Ollama API error ({e.response.status_code}): {str(e)}")
            except httpx.RequestError as e:
                raise ValueError(f"Failed to connect to Ollama at {self.ollama_url}: {str(e)}")
    
    async def vision_completion(
        self,
        image_base64: str,
        image_format: str,
        text_prompt: str,
        model: Optional[str] = None
    ) -> str:
        """
        Get vision completion (for image analysis).
        
        Args:
            image_base64: Base64 encoded image
            image_format: Image format (png, jpeg)
            text_prompt: Text prompt describing what to analyze
            model: Model name (optional)
            
        Returns:
            Generated analysis text
        """
        if self.provider_type == "openai":
            return await self._openai_vision(image_base64, image_format, text_prompt, model)
        else:
            return await self._ollama_vision(image_base64, image_format, text_prompt, model)
    
    async def _openai_vision(
        self,
        image_base64: str,
        image_format: str,
        text_prompt: str,
        model: Optional[str]
    ) -> str:
        """OpenAI vision completion"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")
        
        model = model or "gpt-4o"
        loop = asyncio.get_event_loop()
        
        def make_call():
            return self.openai_client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": text_prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/{image_format};base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
        
        response = await loop.run_in_executor(None, make_call)
        
        if not response or not response.choices:
            raise ValueError("OpenAI API returned empty response")
        
        return response.choices[0].message.content.strip()
    
    async def _ollama_vision(
        self,
        image_base64: str,
        image_format: str,
        text_prompt: str,
        model: Optional[str]
    ) -> str:
        """Ollama vision completion (using llava model)"""
        model = model or self.vision_model
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                # Try /api/generate first (more compatible)
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": text_prompt,
                        "images": [image_base64],
                        "stream": False
                    }
                )
                response.raise_for_status()
                data = response.json()
                result = data.get("response", "").strip()
                
                if result:
                    return result
                
                # Fallback to /api/chat
                response = await client.post(
                    f"{self.ollama_url}/api/chat",
                    json={
                        "model": model,
                        "messages": [
                            {
                                "role": "user",
                                "content": text_prompt,
                                "images": [image_base64]
                            }
                        ],
                        "stream": False
                    }
                )
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "").strip()
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise ValueError(
                        f"Ollama vision model '{model}' not found. "
                        f"Please pull it first: docker exec sigmachain-ollama ollama pull {model}"
                    )
                raise ValueError(f"Ollama API error ({e.response.status_code}): {str(e)}")
            except httpx.RequestError as e:
                raise ValueError(f"Failed to connect to Ollama at {self.ollama_url}: {str(e)}")

