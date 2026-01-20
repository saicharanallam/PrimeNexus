# Database Migrations

This directory contains Alembic migration files for managing database schema changes.

## Setup

1. Install dependencies:
   ```bash
   pip install alembic
   ```

2. Configure database URL in `alembic.ini` or set `DATABASE_URL` environment variable.

## Migration Commands

### Create a new migration
```bash
alembic revision --autogenerate -m "description of changes"
```

### Apply all pending migrations
```bash
alembic upgrade head
```

### Rollback one migration
```bash
alembic downgrade -1
```

### Rollback to a specific revision
```bash
alembic downgrade <revision_id>
```

### View current database revision
```bash
alembic current
```

### View migration history
```bash
alembic history
```

## Migration Files

- `001_initial_schema.py` - Initial database schema (users, chat_threads, chat_messages tables)
- `002_add_user_fields.py` - Added additional user fields (display_name, bio, avatar_url, phone, timezone, preferences)

## Important Notes

- Always review auto-generated migrations before applying them
- Test migrations on a development database first
- Keep migrations small and focused on one change
- Never edit a migration that has already been applied to production

