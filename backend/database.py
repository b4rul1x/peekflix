from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATEBASE_URL = "sqlite:///./peekflix.db"

engine = create_engine(DATEBASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()