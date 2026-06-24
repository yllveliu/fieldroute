"""add performance indexes

Revision ID: a1b2c3d4e5f6
Revises: f2b3c4d5e6f7
Create Date: 2026-06-24

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'f2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Dispatcher board filters jobs heavily by status
    op.create_index('ix_jobs_status', 'jobs', ['status'])
    # Customer portal and assignment service query by customer
    op.create_index('ix_jobs_customer_id', 'jobs', ['customer_id'])
    # Technician job page queries by assigned technician
    op.create_index('ix_jobs_technician_id', 'jobs', ['technician_id'])
    # Dispatcher filters technicians by availability status
    op.create_index('ix_technicians_status', 'technicians', ['status'])
    # Parts lookup by SKU (already has unique constraint, add explicit index for
    # query planner to use on non-unique lookups e.g. ILIKE searches)
    op.create_index('ix_parts_sku', 'parts', ['sku'])


def downgrade() -> None:
    op.drop_index('ix_parts_sku', table_name='parts')
    op.drop_index('ix_technicians_status', table_name='technicians')
    op.drop_index('ix_jobs_technician_id', table_name='jobs')
    op.drop_index('ix_jobs_customer_id', table_name='jobs')
    op.drop_index('ix_jobs_status', table_name='jobs')
