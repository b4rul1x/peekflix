import os
from pathlib import Path
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
from schemas import MovieCreate
from fastapi.middleware.cors import CORSMiddleware

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://peekflix.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    existing = db.query(models.Movie).filter(
        models.Movie.tmdb_id == movie.tmdb_id,
        models.Movie.user_id == movie.user_id
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Цей фільм вже є у вашому списку")

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

@app.delete("/movies/{movie_id}")
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Фільм не знайдено")

    db.delete(movie)
    db.commit()
    return {"detail": "Фільм успішно видалено"}

@app.get("/movie/{tmdb_id}")
async def get_movie_details(tmdb_id: int):
    async with httpx.AsyncClient() as client:
        details_response = await client.get(
            f"https://api.themoviedb.org/3/movie/{tmdb_id}",
            params={"api_key": TMDB_API_KEY, "language": "uk-UA"},
        )
        credits_response = await client.get(
            f"https://api.themoviedb.org/3/movie/{tmdb_id}/credits",
            params={"api_key": TMDB_API_KEY},
        )

    details = details_response.json()
    credits = credits_response.json()

    director = next(
        (person["name"] for person in credits.get("crew", []) if person["job"] == "Director"),
        None,
    )
    cast = [person["name"] for person in credits.get("cast", [])[:5]]

    return {
        "tmdb_id": details.get("id"),
        "title": details.get("title"),
        "overview": details.get("overview"),
        "poster_path": details.get("poster_path"),
        "release_date": details.get("release_date"),
        "runtime": details.get("runtime"),
        "genres": [genre["name"] for genre in details.get("genres", [])],
        "countries": [country["name"] for country in details.get("production_countries", [])],
        "vote_average": details.get("vote_average"),
        "director": director,
        "cast": cast,
    }

