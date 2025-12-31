"""
FastAPI backend for the chat bot application.
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import json

from database.base import get_db, init_db, AsyncSessionLocal
from database.service import UserService, ChatService
from llm_client import OllamaClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Ollama client
ollama_client = OllamaClient()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown"""
    # Startup: Initialize database
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown (if needed)


app = FastAPI(
    title="SigmaChain - Chat Bot",
    description="Simple chat bot with Ollama LLM",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Request/Response Models ====================

class UserCreateRequest(BaseModel):
    username: str
    email: str | None = None


class ChatThreadCreateRequest(BaseModel):
    thread_id: str
    title: str


class ChatThreadUpdateRequest(BaseModel):
    title: str


class ChatMessageCreateRequest(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    metadata: dict | None = None


class ChatMessageRequest(BaseModel):
    content: str


# ==================== User Endpoints ====================

@app.post("/api/users")
async def create_user(
    request: UserCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user"""
    # Check if username already exists
    existing = await UserService.get_user_by_username(db, request.username)
    if existing:
        raise HTTPException(status_code=400, detail=f"Username '{request.username}' already exists")
    
    # Check if email already exists (if provided)
    if request.email:
        existing_email = await UserService.get_user_by_email(db, request.email)
        if existing_email:
            raise HTTPException(status_code=400, detail=f"Email '{request.email}' already exists")
    
    user = await UserService.create_user(
        session=db,
        username=request.username,
        email=request.email,
    )
    await db.commit()
    
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
    }


@app.get("/api/users/{user_id}")
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get user by ID"""
    user = await UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
    }


# ==================== Chat Endpoints ====================

@app.post("/api/chat/threads")
async def create_chat_thread(
    request: ChatThreadCreateRequest,
    user_id: UUID,  # TODO: Get from auth/session
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat thread"""
    # Check if user exists
    user = await UserService.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if thread already exists for this user
    existing = await ChatService.get_chat_thread(db, user_id, request.thread_id, include_messages=False)
    if existing:
        raise HTTPException(status_code=400, detail=f"Chat thread '{request.thread_id}' already exists")
    
    thread = await ChatService.create_chat_thread(
        session=db,
        user_id=user_id,
        thread_id=request.thread_id,
        title=request.title,
    )
    await db.commit()
    
    return {
        "id": str(thread.id),
        "thread_id": thread.thread_id,
        "title": thread.title,
        "created_at": thread.created_at.isoformat(),
        "updated_at": thread.updated_at.isoformat(),
    }


@app.get("/api/chat/threads")
async def list_chat_threads(
    user_id: UUID,  # TODO: Get from auth/session
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """List all chat threads for a user"""
    threads = await ChatService.list_chat_threads(db, user_id, limit=limit)
    
    result = []
    for thread in threads:
        # Get message count
        messages = await ChatService.get_chat_messages(db, user_id, thread.thread_id)
        result.append({
            "id": str(thread.id),
            "thread_id": thread.thread_id,
            "title": thread.title,
            "created_at": thread.created_at.isoformat(),
            "updated_at": thread.updated_at.isoformat(),
            "message_count": len(messages),
        })
    
    return {"threads": result}


@app.get("/api/chat/threads/{thread_id}")
async def get_chat_thread(
    thread_id: str,
    user_id: UUID,  # TODO: Get from auth/session
    db: AsyncSession = Depends(get_db)
):
    """Get a specific chat thread with messages"""
    thread = await ChatService.get_chat_thread(db, user_id, thread_id, include_messages=True)
    
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    
    messages = [
        {
            "id": str(msg.id),
            "role": msg.role,
            "content": msg.content,
            "metadata": msg.message_metadata,
            "created_at": msg.created_at.isoformat(),
        }
        for msg in thread.messages
    ]
    
    return {
        "id": str(thread.id),
        "thread_id": thread.thread_id,
        "title": thread.title,
        "created_at": thread.created_at.isoformat(),
        "updated_at": thread.updated_at.isoformat(),
        "messages": messages,
        "message_count": len(messages),
    }


@app.put("/api/chat/threads/{thread_id}")
async def update_chat_thread(
    thread_id: str,
    request: ChatThreadUpdateRequest,
    user_id: UUID,  # TODO: Get from auth/session
    db: AsyncSession = Depends(get_db)
):
    """Update a chat thread title"""
    thread = await ChatService.update_chat_thread_title(
        session=db,
        user_id=user_id,
        thread_id=thread_id,
        title=request.title,
    )
    
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    
    await db.commit()
    
    return {
        "id": str(thread.id),
        "thread_id": thread.thread_id,
        "title": thread.title,
        "updated_at": thread.updated_at.isoformat(),
    }


@app.delete("/api/chat/threads/{thread_id}")
async def delete_chat_thread(
    thread_id: str,
    user_id: UUID,  # TODO: Get from auth/session
    db: AsyncSession = Depends(get_db)
):
    """Delete a chat thread"""
    deleted = await ChatService.delete_chat_thread(db, user_id, thread_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    
    await db.commit()
    
    return {"message": f"Chat thread '{thread_id}' deleted successfully"}


@app.post("/api/chat/threads/{thread_id}/messages")
async def create_chat_message(
    thread_id: str,
    request: ChatMessageCreateRequest,
    user_id: UUID,  # TODO: Get from auth/session
    db: AsyncSession = Depends(get_db)
):
    """Create a new message in a chat thread"""
    if request.role not in ["user", "assistant"]:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'assistant'")
    
    message = await ChatService.create_chat_message(
        session=db,
        user_id=user_id,
        thread_id=thread_id,
        role=request.role,
        content=request.content,
        metadata=request.metadata,
    )
    
    if not message:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    
    await db.commit()
    
    return {
        "id": str(message.id),
        "thread_id": thread_id,
        "role": message.role,
        "content": message.content,
        "metadata": message.message_metadata,
        "created_at": message.created_at.isoformat(),
    }


@app.get("/api/chat/threads/{thread_id}/messages")
async def get_chat_messages(
    thread_id: str,
    user_id: UUID,  # TODO: Get from auth/session
    limit: int | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all messages for a chat thread"""
    messages = await ChatService.get_chat_messages(db, user_id, thread_id, limit=limit)
    
    return {
        "thread_id": thread_id,
        "messages": [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "metadata": msg.message_metadata,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ],
        "count": len(messages),
    }


@app.post("/api/chat/threads/{thread_id}/stream")
async def stream_chat_response(
    thread_id: str,
    request: ChatMessageRequest,
    user_id: UUID,  # TODO: Get from auth/session
    db: AsyncSession = Depends(get_db)
):
    """
    Stream chat response from LLM.
    Uses Server-Sent Events (SSE) for streaming.
    """
    # Get thread and verify it exists
    thread = await ChatService.get_chat_thread(db, user_id, thread_id, include_messages=True)
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    
    # Save user message
    user_message = await ChatService.create_chat_message(
        session=db,
        user_id=user_id,
        thread_id=thread_id,
        role="user",
        content=request.content,
        metadata={},
    )
    await db.commit()
    
    # Build message history for LLM
    messages = []
    for msg in thread.messages:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Add the new user message
    messages.append({
        "role": "user",
        "content": request.content
    })
    
    # Stream response from Ollama
    async def generate_response():
        full_response = ""
        try:
            async for chunk in ollama_client.stream_chat(messages=messages):
                full_response += chunk
                # Send chunk as SSE
                yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
            
            # Save assistant message to database
            async with AsyncSessionLocal() as save_session:
                await ChatService.create_chat_message(
                    session=save_session,
                    user_id=user_id,
                    thread_id=thread_id,
                    role="assistant",
                    content=full_response,
                    metadata={},
                )
                await save_session.commit()
            
            # Send final done message
            yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
            
        except Exception as e:
            logger.error(f"Error streaming chat response: {e}")
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


# ==================== Settings Endpoints ====================

@app.get("/api/settings")
async def get_settings():
    """Get application settings"""
    return {
        "ollama_url": ollama_client.ollama_url,
        "default_model": ollama_client.default_model,
    }


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
