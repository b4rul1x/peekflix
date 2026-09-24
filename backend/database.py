import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

if os.getenv("RAILWAY_ENVIRONMENT"):
    DATEBASE_URL = "sqlite:////data/peekflix.db"
else:
    DATEBASE_URL = "sqlite:///./peekflix.db"

engine = create_engine(DATEBASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def run_migrations():
    inspector = inspect(engine)
    existing_columns = [col["name"] for col in inspector.get_columns("movies")]

    if "runtime" not in existing_columns:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE movies ADD COLUMN runtime INTEGER"))
            conn.commit()