"""
Database base configuration and session management
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)

# Create base class for models
Base = declarative_base()

# Database URL from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://sigmachain:sigmachain_dev@localhost:5432/sigmachain"
)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    future=True,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session.
    Use this in FastAPI route dependencies.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """
    Initialize database.
    Note: Schema creation is handled by Alembic migrations via the entrypoint script.
    This function is kept for potential future initialization tasks (e.g., data seeding).
    """
    # Schema creation is handled by Alembic migrations, not here
    # This function can be used for other initialization tasks if needed
    logger.info("Database initialization complete (schema managed by Alembic migrations)")

