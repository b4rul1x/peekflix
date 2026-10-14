import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL") or (
    "sqlite:////data/peekflix.db"
    if os.getenv("RAILWAY_ENVIRONMENT")
    else "sqlite:///./peekflix.db"
)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
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

    new_columns = {
        "runtime": "INTEGER",
        "release_date": "VARCHAR",
        "vote_average": "FLOAT",
    }

    with engine.connect() as conn:
        for name, sql_type in new_columns.items():
            if name not in existing_columns:
                conn.execute(text(f"ALTER TABLE movies ADD COLUMN {name} {sql_type}"))
        conn.commit()