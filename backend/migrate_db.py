from app.database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE farm_actions ADD COLUMN IF NOT EXISTS alert_id VARCHAR;"))
        conn.execute(text("ALTER TABLE farm_actions ADD COLUMN IF NOT EXISTS action_type VARCHAR;"))
        conn.execute(text("ALTER TABLE farm_actions ADD COLUMN IF NOT EXISTS action_text VARCHAR;"))
        conn.execute(text("ALTER TABLE farm_actions ADD COLUMN IF NOT EXISTS commitment VARCHAR DEFAULT 'committed';"))
        conn.commit()
    print("Migration finished successfully.")

if __name__ == "__main__":
    run_migration()
