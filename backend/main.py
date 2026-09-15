import os
from pathlib import Path
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
from schemas import MovieCreate, MovieDetailsUpdate
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tmdb import tmdb_get

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

class StatusUpdate(BaseModel):
    status: str

@app.get("/")
def root():
    return {"status": "Peekflix API працює"}

@app.get("/search")
async def search_movies(query: str):
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": "uk-UA",
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

@app.patch("/movies/{movie_id}/status")
def update_movie_status(movie_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Фільм не знайдено")

    movie.status = status_update.status
    db.commit()
    db.refresh(movie)
    return movie

@app.patch("/movies/{movie_id}/details")
def update_movie_details(movie_id: int, details: MovieDetailsUpdate, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Фільм не знайдено")

    if details.user_rating is not None:
        movie.user_rating = details.user_rating

    db.commit()
    db.refresh(movie)
    return movie

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

@app.get("/home/trending")
async def get_trending(page: int = 1):
    data = await tmdb_get("/trending/movie/week", {"language": "uk-UA", "page": page})
    return data

@app.get("/home/top-rated")
async def get_top_rated(page: int = 1):
    data = await tmdb_get("/movie/top_rated", {"language": "uk-UA", "page": page})
    return data

@app.get("/home/now-playing")
async def get_now_playing(page: int = 1):
    data = await tmdb_get("/movie/now_playing", {"language": "uk-UA", "page": page})
    return data

@app.get("/home/continue-watching/{user_id}")
def get_continue_watching(user_id, db: Session = Depends(get_db)):
    movies = db.query(models.Movie).filter(
        models.Movie.user_id == user_id,
        models.Movie.status == "watching"
    ).all()
    return movies

@app.get("/home/genres")
async def get_genres():
    data = await tmdb_get("/genre/movie/list", {"language": "uk-UA"})
    return data["genres"]

@app.get("/home/by-genre")
async def get_by_genre(genre_id: int, page: int = 1):
    data = await tmdb_get("/discover/movie", {
        "language": "uk-UA",
        "with_genres": genre_id,
        "page": page,
        "sort_by": "popularity.desc",
    })
    return data

@app.get("/home/recommendations/{user_id}")
async def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    rated_movies = db.query(models.Movie).filter(
        models.Movie.user_id == user_id,
        models.Movie.user_rating >= 7,
    ).order_by(models.Movie.id.desc()).limit(5).all()

    if not rated_movies:
        return

    added_ids = {m.tmdb_id for m in db.query(models.Movie).filter(models.Movie.user_id == user_id).all()}

    seen_ids = set()
    recommendations = []

    for movie in rated_movies:
        data = await tmdb_get(f"/movie/{movie.tmdb_id}/recommendations")
        for result in data.get("results", []):
            tmdb_id = result["id"]
            if tmdb_id in added_ids or tmdb_id in seen_ids:
                continue
            seen_ids.add(tmdb_id)
            recommendations.append(result)

    return recommendations[:20]

@app.get("/home/similar/{user_id}")
async def get_similar(user_id: int, db: Session = Depends(get_db)):
    top_movie = db.query(models.Movie).filter(
        models.Movie.user_id == user_id,
        models.Movie.user_rating != None,
    ).order_by(models.Movie.user_rating.desc(), models.Movie.id.desc()).first()

    if not top_movie:
        return {"source_title": None, "results": []}

    data = await tmdb_get(f"/movie/{top_movie.tmdb_id}/similar")

    return {
        "source_title": top_movie.title,
        "results": data.get("results", [])
    }