import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from app.config import settings

Base = declarative_base()

def create_db_engine():
    db_url = settings.DATABASE_URL
    try:
        if "postgresql" in db_url:
            test_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
            with test_engine.connect() as conn:
                pass
            return test_engine
    except Exception as e:
        print(f"[Database] PostgreSQL connection failed ({e}), falling back to SQLite (app.db)...")

    # Fallback to local SQLite with fixed absolute path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sqlite_file = os.path.join(base_dir, "app.db").replace("\\", "/")
    sqlite_url = f"sqlite:///{sqlite_file}"
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def ensure_sqlite_schema(engine):
    try:
        with engine.connect() as conn:
            # Check farm_actions table columns
            result = conn.execute(text("PRAGMA table_info(farm_actions)"))
            columns = [row[1] for row in result.fetchall()]
            if columns:
                if "alert_id" not in columns:
                    conn.execute(text("ALTER TABLE farm_actions ADD COLUMN alert_id VARCHAR"))
                if "action_text" not in columns:
                    conn.execute(text("ALTER TABLE farm_actions ADD COLUMN action_text VARCHAR"))
                if "commitment" not in columns:
                    conn.execute(text("ALTER TABLE farm_actions ADD COLUMN commitment VARCHAR DEFAULT 'committed'"))
                conn.commit()
    except Exception:
        pass

# Auto-create tables if SQLite
try:
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_schema(engine)
except Exception:
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
