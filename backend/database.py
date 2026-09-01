import os
from sqlalchemy import create_engine
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
