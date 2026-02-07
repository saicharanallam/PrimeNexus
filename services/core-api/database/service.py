"""
Database service layer for user and chat operations
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from datetime import datetime

from .models import User, ChatThread, ChatMessage


class UserService:
    """Service for user database operations"""

    @staticmethod
    async def create_user(
        session: AsyncSession,
        username: str,
        email: Optional[str] = None,
    ) -> User:
        """Create a new user"""
        user = User(
            username=username,
            email=email,
        )
        session.add(user)
        await session.flush()
        return user

    @staticmethod
    async def get_user(
        session: AsyncSession,
        user_id: UUID,
    ) -> Optional[User]:
        """Get user by ID"""
        query = select(User).where(User.id == user_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_username(
        session: AsyncSession,
        username: str,
    ) -> Optional[User]:
        """Get user by username"""
        query = select(User).where(User.username == username)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(
        session: AsyncSession,
        email: str,
    ) -> Optional[User]:
        """Get user by email"""
        query = select(User).where(User.email == email)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_user(
        session: AsyncSession,
        user_id: UUID,
        username: Optional[str] = None,
        email: Optional[str] = None,
        display_name: Optional[str] = None,
        bio: Optional[str] = None,
        avatar_url: Optional[str] = None,
        phone: Optional[str] = None,
        timezone: Optional[str] = None,
        preferences: Optional[Dict[str, Any]] = None,
    ) -> Optional[User]:
        """Update user information"""
        user = await UserService.get_user(session, user_id)
        if not user:
            return None
        
        # Update fields if provided
        if username is not None:
            # Check if new username is already taken by another user
            existing = await UserService.get_user_by_username(session, username)
            if existing and existing.id != user_id:
                raise ValueError(f"Username '{username}' already exists")
            user.username = username
        
        if email is not None:
            # Check if new email is already taken by another user
            if email:  # Only check if email is not empty
                existing = await UserService.get_user_by_email(session, email)
                if existing and existing.id != user_id:
                    raise ValueError(f"Email '{email}' already exists")
            user.email = email
        
        if display_name is not None:
            user.display_name = display_name
        
        if bio is not None:
            user.bio = bio
        
        if avatar_url is not None:
            user.avatar_url = avatar_url
        
        if phone is not None:
            user.phone = phone
        
        if timezone is not None:
            user.timezone = timezone
        
        if preferences is not None:
            # Merge preferences if existing ones exist
            if user.preferences:
                user.preferences = {**user.preferences, **preferences}
            else:
                user.preferences = preferences
        
        user.updated_at = datetime.utcnow()
        await session.flush()
        return user


class ChatService:
    """Service for chat operations"""

    @staticmethod
    async def create_chat_thread(
        session: AsyncSession,
        user_id: UUID,
        thread_id: str,
        title: str,
    ) -> ChatThread:
        """Create a new chat thread for a user"""
        thread = ChatThread(
            user_id=user_id,
            thread_id=thread_id,
            title=title,
        )
        session.add(thread)
        await session.flush()
        return thread

    @staticmethod
    async def get_chat_thread(
        session: AsyncSession,
        user_id: UUID,
        thread_id: str,
        include_messages: bool = True,
    ) -> Optional[ChatThread]:
        """Get chat thread by user_id and thread_id"""
        query = select(ChatThread).where(
            ChatThread.user_id == user_id,
            ChatThread.thread_id == thread_id
        )
        if include_messages:
            query = query.options(selectinload(ChatThread.messages))
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_chat_threads(
        session: AsyncSession,
        user_id: UUID,
        limit: int = 50,
    ) -> List[ChatThread]:
        """List all chat threads for a user, ordered by most recent"""
        query = (
            select(ChatThread)
            .where(ChatThread.user_id == user_id)
            .order_by(desc(ChatThread.updated_at))
            .limit(limit)
        )
        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_chat_thread_title(
        session: AsyncSession,
        user_id: UUID,
        thread_id: str,
        title: str,
    ) -> Optional[ChatThread]:
        """Update chat thread title"""
        thread = await ChatService.get_chat_thread(session, user_id, thread_id, include_messages=False)
        if not thread:
            return None
        
        thread.title = title
        thread.updated_at = datetime.utcnow()
        await session.flush()
        return thread

    @staticmethod
    async def delete_chat_thread(
        session: AsyncSession,
        user_id: UUID,
        thread_id: str,
    ) -> bool:
        """Delete a chat thread (cascade deletes messages)"""
        thread = await ChatService.get_chat_thread(session, user_id, thread_id, include_messages=False)
        if not thread:
            return False
        
        await session.delete(thread)
        await session.flush()
        return True

    @staticmethod
    async def create_chat_message(
        session: AsyncSession,
        user_id: UUID,
        thread_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[ChatMessage]:
        """Create a new chat message in a thread"""
        thread = await ChatService.get_chat_thread(session, user_id, thread_id, include_messages=False)
        if not thread:
            return None
        
        message = ChatMessage(
            thread_id=thread.id,
            role=role,
            content=content,
            message_metadata=metadata or {},
        )
        session.add(message)
        
        # Update thread's updated_at timestamp
        thread.updated_at = datetime.utcnow()
        
        await session.flush()
        return message

    @staticmethod
    async def get_chat_messages(
        session: AsyncSession,
        user_id: UUID,
        thread_id: str,
        limit: Optional[int] = None,
    ) -> List[ChatMessage]:
        """Get all messages for a chat thread"""
        thread = await ChatService.get_chat_thread(session, user_id, thread_id, include_messages=False)
        if not thread:
            return []
        
        query = (
            select(ChatMessage)
            .where(ChatMessage.thread_id == thread.id)
            .order_by(ChatMessage.created_at)
        )
        if limit:
            query = query.limit(limit)
        
        result = await session.execute(query)
        return list(result.scalars().all())

