#!/usr/bin/env python3
"""
Helper script to run database migrations.
Usage:
    python scripts/run_migrations.py upgrade    # Apply all pending migrations
    python scripts/run_migrations.py downgrade  # Rollback one migration
    python scripts/run_migrations.py current    # Show current revision
    python scripts/run_migrations.py history   # Show migration history
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from alembic.config import Config
from alembic import command

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/run_migrations.py <command>")
        print("Commands: upgrade, downgrade, current, history, create <message>")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    # Get alembic config
    alembic_cfg = Config(str(backend_dir / "alembic.ini"))
    
    # Override database URL from environment
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://sigmachain:sigmachain_dev@localhost:5432/sigmachain"
    )
    # Convert asyncpg URL to psycopg2 for Alembic
    database_url = database_url.replace("+asyncpg", "")
    alembic_cfg.set_main_option("sqlalchemy.url", database_url)
    
    if cmd == "upgrade":
        print("Applying all pending migrations...")
        command.upgrade(alembic_cfg, "head")
        print("✓ Migrations applied successfully")
    elif cmd == "downgrade":
        print("Rolling back one migration...")
        command.downgrade(alembic_cfg, "-1")
        print("✓ Migration rolled back")
    elif cmd == "current":
        print("Current database revision:")
        command.current(alembic_cfg)
    elif cmd == "history":
        print("Migration history:")
        command.history(alembic_cfg)
    elif cmd == "create":
        if len(sys.argv) < 3:
            print("Usage: python scripts/run_migrations.py create <message>")
            sys.exit(1)
        message = sys.argv[2]
        print(f"Creating new migration: {message}")
        command.revision(alembic_cfg, message, autogenerate=True)
        print("✓ Migration created")
    else:
        print(f"Unknown command: {cmd}")
        print("Available commands: upgrade, downgrade, current, history, create")
        sys.exit(1)

if __name__ == "__main__":
    main()

