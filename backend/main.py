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
from datetime import date, timedelta
from featured import FEATURED_COLLECTIONS
import random
from collections import Counter

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

EN_LAYOUT = "qwertyuiop[]asdfghjkl;'zxcvbnm,."
UK_LAYOUT = "йцукенгшщзхїфівапролджєячсмитьбю"
EN_TO_UK = str.maketrans(EN_LAYOUT, UK_LAYOUT)


def normalize_query(q: str) -> str:
    q = q.lower().strip()
    q = re.sub(r"[^\w\s]", " ", q)
    q = re.sub(r"\s+", " ", q)
    return q.strip()


def query_variants(q: str) -> list[str]:
    raw = q.lower().strip()
    normalized = normalize_query(raw)
    variants = [normalized]

    if re.fullmatch(r"[a-z\s\[\];',.]+", raw):
        variants.append(normalize_query(raw.translate(EN_TO_UK)))

    words = normalized.split()
    if len(words) > 1:
        variants.append(" ".join(words[:-1]))
    if len(normalized) > 4:
        variants.append(normalized[:-1])

    return list(dict.fromkeys(v for v in variants if v))

def split_year(q: str):
    q = q.strip()

    m = re.match(r"^(.+?)\s+(\d{4})$", q)
    if m:
        title, year = m.group(1), int(m.group(2))
    else:
        m = re.match(r"^(\d{4})\s+(.+)$", q)
        if not m:
            return q, None
        year, title = int(m.group(1)), m.group(2)

    if 1900 <= year <= date.today().year + 2:
        return title, year
    return q, None

async def tmdb_search(query: str, year: Optional[int] = None):
    params = {"query": query, "language": "uk-UA"}
    if year:
        params["primary_release_year"] = year
    data = await tmdb_get("/search/movie", params)
    return data.get("results", [])


@app.get("/search")
async def search_movies(query: str):
    title, year = split_year(query)

    attempts = [(v, year) for v in query_variants(title)]
    if year:
        attempts += [(v, None) for v in query_variants(query)]

    for text, y in attempts:
        results = await tmdb_search(text, y)
        if results:
            results = sorted(
                results,
                key=lambda movie: movie.get("popularity", 0),
                reverse=True,
            )
            return results[:10]
    return []

@app.post("/movies")
async def add_movies(movie: MovieCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Movie).filter(
        models.Movie.tmdb_id == movie.tmdb_id,
        models.Movie.user_id == movie.user_id
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Цей фільм вже є у вашому списку")

    runtime = movie.runtime
    release_date = None
    vote_average = None

    try:
        async with httpx.AsyncClient() as client:
            details_response = await client.get(
                f"https://api.themoviedb.org/3/movie/{movie.tmdb_id}",
                params={"api_key": TMDB_API_KEY},
                timeout=5.0
            )

        if details_response.status_code == 200:
            details = details_response.json()
            if runtime is None:
                runtime = details.get("runtime")
            release_date = details.get("release_date") or None
            vote_average = details.get("vote_average")
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
        release_date=release_date,
        vote_average=vote_average,
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

@app.get("/movie/{tmdb_id}/similar")
async def get_similar_movies(tmdb_id: int):
    data = await tmdb_get(f"/movie/{tmdb_id}/recommendations", {"language": "uk-UA"})
    results = data.get("results", [])

    if len(results) < 6:
        fallback = await tmdb_get(f"/movie/{tmdb_id}/similar", {"language": "uk-UA"})
        seen = {movie["id"] for movie in results}
        results += [m for m in fallback.get("results", []) if m["id"] not in seen]

    return [
        {
            "tmdb_id": movie["id"],
            "title": movie.get("title"),
            "poster_path": movie.get("poster_path"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
        }
        for movie in results
        if movie.get("poster_path")
    ][:12]

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
        key=lambda movie: movie.get("release_date") or "9999"
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

@app.get("/home/upcoming")
async def get_upcoming(page: int = 1):
    today = date.today()

    data = await tmdb_get("/discover/movie", {
        "language": "uk-UA",
        "page": page,
        "sort_by": "popularity.desc",
        "primary_release_date.gte": today.isoformat(),
        "primary_release_date.lte": (today + timedelta(days=90)).isoformat(),
        "with_release_type": "2|3",
        "include_adult": "false",
    })

    data["results"].sort(key=lambda m: m.get("release_date") or "9999")
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
    movies = db.query(models.Movie).filter(models.Movie.user_id == user_id).order_by(models.Movie.id.desc()).limit(6).all()
    return movies

_collection_cache = {}


async def _load_collection_card(collection_id: int):
    if collection_id in _collection_cache:
        return _collection_cache[collection_id]
    try:
        data = await tmdb_get(f"/collection/{collection_id}", {"language": "uk-UA"})
    except Exception:
        return None
    if not data or not data.get("id") or not data.get("parts"):
        return None

    card = {
        "id": data["id"],
        "name": clean_collection_name(data.get("name") or ""),
        "backdrop_path": data.get("backdrop_path"),
        "poster_path": data.get("poster_path"),
        "count": len(data["parts"]),
    }
    _collection_cache[collection_id] = card
    return card


@app.get("/home/collections")
async def get_featured_collections():
    ids = random.sample(FEATURED_COLLECTIONS, 10)
    cards = await asyncio.gather(*[_load_collection_card(i) for i in ids])
    return [c for c in cards if c and (c["backdrop_path"] or c["poster_path"])]


@app.get("/home/collection/{collection_id}")
async def get_collection_movies(collection_id: int, page: int = 1):
    data = await tmdb_get(f"/collection/{collection_id}", {"language": "uk-UA"})
    parts = sorted(
        data.get("parts", []),
        key=lambda m: m.get("release_date") or "9999",
    )
    return {"results": parts, "total_pages": 1}


@app.get("/home/favorite-genre/{user_id}")
async def get_favorite_genre(user_id: int, db: Session = Depends(get_db)):
    user_movies = db.query(models.Movie).filter(
        models.Movie.user_id == user_id,
        models.Movie.status != "dropped",
    ).order_by(models.Movie.id.desc()).all()

    added_ids = {m.tmdb_id for m in user_movies}
    recent = user_movies[:10]

    async def get_genres(movie):
        try:
            d = await tmdb_get(f"/movie/{movie.tmdb_id}", {"language": "uk-UA"})
        except Exception:
            return movie, []
        return movie, d.get("genres", [])

    scores = Counter()
    names = {}
    for movie, genres in await asyncio.gather(*[get_genres(m) for m in recent]):
        weight = 2 if (movie.status == "favorite" or (movie.user_rating or 0) >= 7) else 1
        for g in genres:
            scores[g["id"]] += weight
            names[g["id"]] = g["name"]

    if scores:
        genre_id = scores.most_common(1)[0][0]
        genre_name = names[genre_id]
        personalized = True
    else:
        genre_id, genre_name, personalized = 28, "Бойовик", False

    data = await tmdb_get("/discover/movie", {
        "language": "uk-UA",
        "with_genres": genre_id,
        "sort_by": "popularity.desc",
        "page": 1,
    })
    results = [m for m in data.get("results", []) if m["id"] not in added_ids]

    return {
        "genre_id": genre_id,
        "genre_name": genre_name,
        "personalized": personalized,
        "results": results,
    }