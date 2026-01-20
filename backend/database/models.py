"""
Database models for users and chat
"""

from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .base import Base


class User(Base):
    """
    Stores user accounts.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    
    # Additional user fields
    display_name = Column(String(255), nullable=True)  # Friendly display name
    bio = Column(Text, nullable=True)  # User bio/description
    avatar_url = Column(String(500), nullable=True)  # Profile picture URL
    phone = Column(String(50), nullable=True)  # Phone number
    timezone = Column(String(100), nullable=True, default="UTC")  # User timezone
    preferences = Column(JSON, nullable=True)  # User preferences (theme, notifications, etc.)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chat_threads = relationship("ChatThread", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(username={self.username}, id={self.id})>"


class ChatThread(Base):
    """
    Stores chat conversation threads.
    """
    __tablename__ = "chat_threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    thread_id = Column(String(255), nullable=False, index=True)  # Human-readable ID, unique per user
    title = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)
    
    # Unique constraint: thread_id must be unique per user
    __table_args__ = (UniqueConstraint('user_id', 'thread_id', name='uq_user_thread'),)
    
    # Relationships
    user = relationship("User", back_populates="chat_threads")
    messages = relationship("ChatMessage", back_populates="thread", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def __repr__(self):
        return f"<ChatThread(thread_id={self.thread_id}, title={self.title}, user_id={self.user_id})>"


class ChatMessage(Base):
    """
    Stores individual messages within a chat thread.
    """
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("chat_threads.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Message content
    role = Column(String(50), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    
    # Metadata
    message_metadata = Column(JSON)  # Additional metadata (optional)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    thread = relationship("ChatThread", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(role={self.role}, content_length={len(self.content) if self.content else 0})>"
