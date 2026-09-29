"""add_farm_actions_table

Revision ID: add_farm_actions_table
Revises: 
Create Date: 2026-09-29 14:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_farm_actions_table'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'farm_actions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('farmer_id', sa.String(), nullable=False),
        sa.Column('equipment_id', sa.String(), nullable=False),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False, server_default='recommended'),
        sa.Column('title_key', sa.String(), nullable=False),
        sa.Column('evidence_json', sa.JSON(), nullable=True),
        sa.Column('steps_json', sa.JSON(), nullable=True),
        sa.Column('expected_outcome_json', sa.JSON(), nullable=True),
        sa.Column('confidence', sa.String(), nullable=False),
        sa.Column('action_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['equipment_id'], ['equipment.id'], ),
        sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_farm_actions_id'), 'farm_actions', ['id'], unique=False)
    op.create_index(op.f('ix_farm_actions_farmer_id'), 'farm_actions', ['farmer_id'], unique=False)
    op.create_index(op.f('ix_farm_actions_equipment_id'), 'farm_actions', ['equipment_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_farm_actions_equipment_id'), table_name='farm_actions')
    op.drop_index(op.f('ix_farm_actions_farmer_id'), table_name='farm_actions')
    op.drop_index(op.f('ix_farm_actions_id'), table_name='farm_actions')
    op.drop_table('farm_actions')
