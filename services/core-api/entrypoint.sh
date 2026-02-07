#!/bin/bash
set -e

echo "Starting database migration..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

# Use Python to check database connection (handles URL conversion)
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if python -c "
import os
import sys
import psycopg2

db_url = os.environ.get('DATABASE_URL', '')
if not db_url:
    print('ERROR: DATABASE_URL not set', file=sys.stderr)
    sys.exit(1)

# Convert asyncpg URL to psycopg2 format
db_url = db_url.replace('postgresql+asyncpg://', 'postgresql://')
db_url = db_url.replace('+asyncpg', '')

try:
    conn = psycopg2.connect(db_url, connect_timeout=2)
    conn.close()
    print('Database connection successful')
    sys.exit(0)
except psycopg2.OperationalError as e:
    # Database not ready yet - this is expected
    sys.exit(1)
except Exception as e:
    print(f'Unexpected error: {e}', file=sys.stderr)
    sys.exit(1)
" 2>/dev/null; then
        echo "Database is ready!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "Database is unavailable - sleeping (attempt $RETRY_COUNT/$MAX_RETRIES)"
            sleep 2
        else
            echo "ERROR: Database connection failed after $MAX_RETRIES attempts"
            echo "Please check that the database container is running and healthy"
            exit 1
        fi
    fi
done

# Check if Alembic version table exists
echo "Checking Alembic migration status..."
ALEMBIC_VERSION_EXISTS=$(python -c "
import os
import psycopg2

db_url = os.environ.get('DATABASE_URL', '').replace('postgresql+asyncpg://', 'postgresql://').replace('+asyncpg', '')
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute(\"\"\"
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'alembic_version'
        );
    \"\"\")
    exists = cur.fetchone()[0]
    cur.close()
    conn.close()
    print('true' if exists else 'false')
except Exception as e:
    print('false')
" 2>/dev/null)

# If tables exist but Alembic version table doesn't, stamp with initial revision
if [ "$ALEMBIC_VERSION_EXISTS" != "true" ]; then
    echo "Alembic version table not found. Checking if tables exist..."
    TABLES_EXIST=$(python -c "
import os
import psycopg2

db_url = os.environ.get('DATABASE_URL', '').replace('postgresql+asyncpg://', 'postgresql://').replace('+asyncpg', '')
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute(\"\"\"
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        );
    \"\"\")
    exists = cur.fetchone()[0]
    cur.close()
    conn.close()
    print('true' if exists else 'false')
except Exception as e:
    print('false')
" 2>/dev/null)
    
    if [ "$TABLES_EXIST" = "true" ]; then
        echo "Tables exist but Alembic version table doesn't. Stamping database with initial revision..."
        python -c "
import os
import sys
from pathlib import Path
from alembic.config import Config
from alembic import command

backend_dir = Path('/app')
alembic_cfg = Config(str(backend_dir / 'alembic.ini'))
database_url = os.environ.get('DATABASE_URL', '').replace('+asyncpg', '')
alembic_cfg.set_main_option('sqlalchemy.url', database_url)
command.stamp(alembic_cfg, '001_initial')
print('Database stamped with initial revision')
"
    fi
fi

# Run Alembic migrations
echo "Running Alembic migrations..."
python scripts/run_migrations.py upgrade

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully!"
else
    echo "Migration failed! Check the logs above."
    exit 1
fi

# Start the application
echo "Starting FastAPI application..."
exec "$@"
