import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
import httpx

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

async def search_movie(query: str):
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    print(f"\n=== Пошук: '{query}' ===")
    for movie in data["results"][:3]:
        print(f"{movie['title']} | popularity: {movie.get('popularity')} | {movie.get('release_date', 'н/д')}")

async def main():
    queries = ["The Dark Knight", "Interstellar", "Titanic", "Matrix", "Avengers"]
    for q in queries:
        await search_movie(q)

asyncio.run(main())