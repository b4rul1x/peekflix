import os
from pathlib import Path
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
from schemas import MovieCreate

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"status": "Peekflix API працює"}

@app.get("/search")
async def search_movies(query: str):
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": query
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    results = sorted(
        data["results"],
        key=lambda movie: movie.get("popularity", 0),
        reverse=True
    )
    return results[:10]

@app.post("/movies")
def add_movies(movie: MovieCreate, db: Session = Depends(get_db)):
    new_movie = models.Movie(
        tmdb_id=movie.tmdb_id,
        title=movie.title,
        poster_path=movie.poster_path,
        user_id=movie.user_id,
        status=movie.status,
    )
    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)
    return new_movie

@app.get("/movies/{user_id}")
def get_user_movies(user_id: int, db: Session = Depends(get_db)):
    movies = db.query(models.Movie).filter(models.Movie.user_id == user_id).all()
    return movies