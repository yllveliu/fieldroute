"""add technician application fields

Adds the self-service technician application columns to ``technicians``:
a link to the login account (user_id), the application lifecycle status,
the AI CV-review result, and the uploaded CV (PDF stored in-DB).

Revision ID: e1a2b3c4d5e6
Revises: d0e78adb0cf8
Create Date: 2026-06-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1a2b3c4d5e6'
down_revision: Union[str, None] = 'd0e78adb0cf8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('technicians', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_unique_constraint(
        'uq_technicians_user_id', 'technicians', ['user_id']
    )
    op.create_foreign_key(
        'fk_technicians_user_id_users', 'technicians', 'users',
        ['user_id'], ['id'],
    )
    op.add_column(
        'technicians',
        sa.Column(
            'application_status', sa.String(), nullable=False,
            server_default='approved',
        ),
    )
    op.add_column('technicians', sa.Column('ai_match_score', sa.Float(), nullable=True))
    op.add_column('technicians', sa.Column('ai_match_summary', sa.Text(), nullable=True))
    op.add_column('technicians', sa.Column('cv_data', sa.LargeBinary(), nullable=True))
    op.add_column('technicians', sa.Column('cv_filename', sa.String(), nullable=True))
    op.add_column('technicians', sa.Column('cv_content_type', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('technicians', 'cv_content_type')
    op.drop_column('technicians', 'cv_filename')
    op.drop_column('technicians', 'cv_data')
    op.drop_column('technicians', 'ai_match_summary')
    op.drop_column('technicians', 'ai_match_score')
    op.drop_column('technicians', 'application_status')
    op.drop_constraint('fk_technicians_user_id_users', 'technicians', type_='foreignkey')
    op.drop_constraint('uq_technicians_user_id', 'technicians', type_='unique')
    op.drop_column('technicians', 'user_id')
