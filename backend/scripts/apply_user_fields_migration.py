#!/usr/bin/env python3
"""
Script to add new user fields to existing database.
Run this inside the backend container or locally with database access.
"""

import asyncio
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://sigmachain:sigmachain_dev@localhost:5432/sigmachain"
)

async def apply_migration():
    """Apply migration to add new user fields"""
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Check and add columns if they don't exist
            migration_sql = """
            DO $$ 
            BEGIN
                -- Add display_name
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='display_name') THEN
                    ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
                END IF;
                
                -- Add bio
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bio') THEN
                    ALTER TABLE users ADD COLUMN bio TEXT;
                END IF;
                
                -- Add avatar_url
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
                    ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
                END IF;
                
                -- Add phone
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
                    ALTER TABLE users ADD COLUMN phone VARCHAR(50);
                END IF;
                
                -- Add timezone
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='timezone') THEN
                    ALTER TABLE users ADD COLUMN timezone VARCHAR(100) DEFAULT 'UTC';
                END IF;
                
                -- Add preferences
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='preferences') THEN
                    ALTER TABLE users ADD COLUMN preferences JSON;
                END IF;
                
                -- Update existing users to have default timezone
                UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL;
            END $$;
            """
            
            await session.execute(text(migration_sql))
            await session.commit()
            print("✓ Migration applied successfully!")
            print("✓ Added columns: display_name, bio, avatar_url, phone, timezone, preferences")
            
        except Exception as e:
            await session.rollback()
            print(f"✗ Error applying migration: {e}")
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(apply_migration())

