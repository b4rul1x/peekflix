import os
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base, get_db, run_migrations
from utils import fix_missing_runtimes
import models
from schemas import MovieCreate, MovieDetailsUpdate
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tmdb import tmdb_get
import re
from typing import Optional
import asyncio

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

def clean_collection_name(name: str) -> str:
    if not name:
        return name
    return re.sub(r"\s*\|?\s*Колекція\s*$", "", name).strip()

person_name_cache = {}

async def get_ukrainian_name(client, person_id, fallback):
    if person_id in person_name_cache:
        return person_name_cache[person_id]
    try:
        response = await client.get(
            f"https://api.themoviedb.org/3/person/{person_id}",
            params={"api_key": TMDB_API_KEY, "language": "uk-UA"},
            timeout=5.0,
        )
        name = response.json().get("name") or fallback
    except Exception:
        return fallback
    person_name_cache[person_id] = name
    return name

Base.metadata.create_all(bind=engine)
run_migrations()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await fix_missing_runtimes(get_db)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://peekflix.vercel.app",
        "https://peekflix.x0ryz.dev",
    ],
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
async def add_movies(movie: MovieCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Movie).filter(
        models.Movie.tmdb_id == movie.tmdb_id,
        models.Movie.user_id == movie.user_id
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Цей фільм вже є у вашому списку")

    runtime = movie.runtime

    if runtime is None:
        try:
            async with httpx.AsyncClient() as client:
                details_response = await client.get(
                    f"https://api.themoviedb.org/3/movie/{movie.tmdb_id}",
                    params={"api_key": TMDB_API_KEY},
                    timeout=5.0
                )

            if details_response.status_code == 200:
                details = details_response.json()
                runtime = details.get("runtime")
            else:
                print(f"TMDB API повернув помилку {details_response.status_code}: {details_response.text}")
        except Exception as e:
            print(f"Помилка з'єднання з TMDB API: {e}")

    new_movie = models.Movie(
        tmdb_id=movie.tmdb_id,
        title=movie.title,
        poster_path=movie.poster_path,
        user_id=movie.user_id,
        status=movie.status,
        runtime=runtime,
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
        videos_response = await client.get(
            f"https://api.themoviedb.org/3/movie/{tmdb_id}/videos",
            params={"api_key": TMDB_API_KEY, "language": "uk-UA"},
        )

    details = details_response.json()
    credits = credits_response.json()
    videos = videos_response.json()

    def find_trailer(video_list):
        return next(
            (v for v in video_list if v.get("type") == "Trailer" and v.get("site") == "YouTube"),
            None,
        )

    trailer = find_trailer(videos.get("results", []))

    if not trailer:
        fallback_response = await httpx.AsyncClient().get(
            f"https://api.themoviedb.org/3/movie/{tmdb_id}/videos",
            params={"api_key": TMDB_API_KEY},
        )
        trailer = find_trailer(fallback_response.json().get("results", []))

    director_person = next(
        (person for person in credits.get("crew", []) if person["job"] == "Director"),
        None,
    )
    cast_people = credits.get("cast", [])[:5]

    people = ([director_person] if director_person else []) + cast_people
    async with httpx.AsyncClient() as client:
        names = await asyncio.gather(*[
            get_ukrainian_name(client, person["id"], person["name"])
            for person in people
        ])
    name_by_id = {person["id"]: name for person, name in zip(people, names)}

    director = (
        {"id": director_person["id"], "name": name_by_id[director_person["id"]]}
        if director_person else None
    )
    cast = [
        {"id": person["id"], "name": name_by_id[person["id"]]}
        for person in cast_people
    ]

    collection = details.get("belongs_to_collection")

    return {
        "tmdb_id": details.get("id"),
        "title": details.get("title"),
        "overview": details.get("overview"),
        "poster_path": details.get("poster_path"),
        "release_date": details.get("release_date"),
        "runtime": details.get("runtime"),
        "genres": [
            {"id": genre["id"], "name": genre["name"]}
            for genre in details.get("genres", [])
        ],
        "countries": [
            {"code": country["iso_3166_1"], "name": country["name"]}
            for country in details.get("production_countries", [])
        ],
        "vote_average": details.get("vote_average"),
        "director": director,
        "cast": cast,
        "trailer_key": trailer["key"] if trailer else None,
        "collection_id": collection["id"] if collection else None,
        "collection_name": clean_collection_name(collection["name"]) if collection else None,
    }

@app.get("/collection/{collection_id}")
async def get_collection(collection_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.themoviedb.org/3/collection/{collection_id}",
            params={"api_key": TMDB_API_KEY, "language": "uk-UA"},
        )

    data = response.json()

    parts = sorted(
        data.get("parts", []),
        key=lambda movie: movie.get("release_data") or "9999"
    )

    return {
        "collection_name": clean_collection_name(data.get("name")),
        "parts": [
            {
                "tmdb_id": movie.get("id"),
                "title": movie.get("title"),
                "release_date": movie.get("release_date"),
                "vote_average": movie.get("vote_average"),
            }
            for movie in parts
        ],
    }

@app.get("/person/{person_id}")
async def get_person(person_id: int):
    async with httpx.AsyncClient() as client:
        details_response = await client.get(
            f"https://api.themoviedb.org/3/person/{person_id}",
            params={"api_key": TMDB_API_KEY, "language": "uk-UA"},
        )
        credits_response = await client.get(
            f"https://api.themoviedb.org/3/person/{person_id}/movie_credits",
            params={"api_key": TMDB_API_KEY, "language": "uk-UA"},
        )

        details = details_response.json()
        credits = credits_response.json()

        biography = details.get("biography")
        if not biography:
            fallback_response = await client.get(
                f"https://api.themoviedb.org/3/person/{person_id}",
                params={"api_key": TMDB_API_KEY},
            )
            biography = fallback_response.json().get("biography")

    def to_movie(item):
        return {
            "tmdb_id": item.get("id"),
            "title": item.get("title"),
            "poster_path": item.get("poster_path"),
            "release_date": item.get("release_date"),
            "vote_average": item.get("vote_average"),
            "popularity": item.get("popularity", 0),
        }

    def unique_sorted(items):
        seen = set()
        result = []
        for item in sorted(items, key=lambda m: m["popularity"], reverse=True):
            if item["tmdb_id"] in seen:
                continue
            seen.add(item["tmdb_id"])
            result.append(item)
        return result

    acted = unique_sorted([
        to_movie(m) for m in credits.get("cast", [])
        if 99 not in m.get("genre_ids", [])
    ])
    directed = unique_sorted([
        to_movie(m) for m in credits.get("crew", []) if m.get("job") == "Director"
    ])

    return {
        "id": details.get("id"),
        "name": details.get("name"),
        "profile_path": details.get("profile_path"),
        "biography": biography,
        "birthday": details.get("birthday"),
        "deathday": details.get("deathday"),
        "place_of_birth": details.get("place_of_birth"),
        "known_for_department": details.get("known_for_department"),
        "acted": acted,
        "directed": directed,
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

@app.get("/home/by-filter")
async def get_by_filter(
    genre_id: Optional[int] = None,
    year: Optional[int] = None,
    country: Optional[str] = None,
    page: int = 1,
):
    params = {
        "language": "uk-UA",
        "page": page,
        "sort_by": "popularity.desc",
    }
    if genre_id:
        params["with_genres"] = genre_id
    if year:
        params["primary_release_year"] = year
    if country:
        params["with_origin_country"] = country

    return await tmdb_get("/discover/movie", params)

@app.get("/home/recommendations/{user_id}")
async def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    rated_movies = db.query(models.Movie).filter(
        models.Movie.user_id == user_id,
        models.Movie.user_rating >= 7,
    ).order_by(models.Movie.id.desc()).limit(5).all()

    if not rated_movies:
        return []

    added_ids = {m.tmdb_id for m in db.query(models.Movie).filter(models.Movie.user_id == user_id).all()}

    seen_ids = set()
    recommendations = []

    for movie in rated_movies:
        data = await tmdb_get(f"/movie/{movie.tmdb_id}/recommendations", {"language": "uk-UA"})
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

    data = await tmdb_get(f"/movie/{top_movie.tmdb_id}/similar", {"language": "uk-UA"})

    return {
        "source_title": top_movie.title,
        "results": data.get("results", [])
    }

@app.get("/profile/stats/{user_id}")
def get_profile_stats(user_id: int, db: Session = Depends(get_db)):
    movies = db.query(models.Movie).filter(models.Movie.user_id == user_id).all()

    stats = {}
    total_runtime = 0

    for movie in movies:
        status = movie.status
        runtime = movie.runtime or 0
        if status not in stats:
            stats[status] = {"count": 0, "runtime": 0}
        stats[status]["count"] += 1
        stats[status]["runtime"] += runtime
        total_runtime += runtime

    by_status = []
    for status, data in stats.items():
        percentage = round((data["runtime"] / total_runtime) * 100, 1) if total_runtime > 0 else 0
        by_status.append({
            "status": status,
            "count": data["count"],
            "runtime_minutes": data["runtime"],
            "percentage": percentage,
        })

    return {
        "total_runtime_minutes": total_runtime,
        "by_status": by_status,
    }

@app.get("/profile/recent/{user_id}")
def get_recent_movies(user_id: int, db: Session = Depends(get_db)):
    movies = db.query(models.Movie).filter(models.Movie.user_id == user_id).order_by(models.Movie.id.desc()).limit(5).all()
    return movies