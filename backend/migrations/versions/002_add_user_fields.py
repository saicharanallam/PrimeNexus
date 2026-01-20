"""Add additional user fields

Revision ID: 002_add_user_fields
Revises: 001_initial
Create Date: 2024-01-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_add_user_fields'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('display_name', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('timezone', sa.String(100), nullable=True, server_default='UTC'))
    op.add_column('users', sa.Column('preferences', postgresql.JSON(), nullable=True))
    
    # Update existing users to have default timezone
    op.execute("UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL")


def downgrade() -> None:
    op.drop_column('users', 'preferences')
    op.drop_column('users', 'timezone')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'display_name')

