# Database Migrations

This directory contains Alembic migration files for managing database schema changes.

## Automatic Migrations (Docker)

**Migrations run automatically** when the backend container starts. The entrypoint script (`entrypoint.sh`) runs `alembic upgrade head` before starting the FastAPI application.

### How It Works

1. When the backend container starts, it waits for the database to be ready
2. Runs all pending Alembic migrations automatically
3. Starts the FastAPI application

This ensures your database schema is always up-to-date when the application starts.

## Manual Migration Commands

### Using Docker (Recommended)

Run migrations manually using the migration script:

```bash
# Apply all pending migrations
docker compose exec backend python scripts/run_migrations.py upgrade

# View current revision
docker compose exec backend python scripts/run_migrations.py current

# View migration history
docker compose exec backend python scripts/run_migrations.py history

# Rollback one migration
docker compose exec backend python scripts/run_migrations.py downgrade

# Create a new migration
docker compose exec backend python scripts/run_migrations.py create "description of changes"
```

### Using Separate Migration Container (Optional)

You can also use the dedicated migration service:

```bash
# Apply migrations
docker compose --profile migrations run --rm migrations upgrade

# View current revision
docker compose --profile migrations run --rm migrations current
```

### Local Development (Without Docker)

1. Install dependencies:
   ```bash
   pip install alembic psycopg2-binary
   ```

2. Set `DATABASE_URL` environment variable:
   ```bash
   export DATABASE_URL=postgresql+asyncpg://sigmachain:sigmachain_dev@localhost:5432/sigmachain
   ```

3. Run migrations:
   ```bash
   # Apply all pending migrations
   python scripts/run_migrations.py upgrade
   
   # Or use Alembic directly
   alembic upgrade head
   ```

## Migration Commands Reference

### Create a new migration
```bash
# Using the script
python scripts/run_migrations.py create "description of changes"

# Or using Alembic directly
alembic revision --autogenerate -m "description of changes"
```

### Apply all pending migrations
```bash
python scripts/run_migrations.py upgrade
# or
alembic upgrade head
```

### Rollback one migration
```bash
python scripts/run_migrations.py downgrade
# or
alembic downgrade -1
```

### Rollback to a specific revision
```bash
alembic downgrade <revision_id>
```

### View current database revision
```bash
python scripts/run_migrations.py current
# or
alembic current
```

### View migration history
```bash
python scripts/run_migrations.py history
# or
alembic history
```

## Migration Files

- `001_initial_schema.py` - Initial database schema (users, chat_threads, chat_messages tables)
- `002_add_user_fields.py` - Added additional user fields (display_name, bio, avatar_url, phone, timezone, preferences)

## Important Notes

- **Migrations run automatically** on container startup - no manual intervention needed
- Always review auto-generated migrations before committing them
- Test migrations on a development database first
- Keep migrations small and focused on one change
- Never edit a migration that has already been applied to production
- The entrypoint script ensures migrations run before the app starts, preventing schema mismatch errors

