import os
from pathlib import Path
from dotenv import load_dotenv
import httpx
from fastapi import FastAPI
from database import engine, Base
import models

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