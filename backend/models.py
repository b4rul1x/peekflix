from sqlalchemy import Column, Integer, String, Text, Float
from database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer)
    title = Column(String)
    poster_path = Column(String)
    user_id = Column(Integer, index=True)
    status = Column(String, default="watched")
    user_rating = Column(Integer, nullable=True)
    runtime = Column(Integer, nullable=True)
    release_date = Column(String, nullable=True)
    vote_average = Column(Float, nullable=True)