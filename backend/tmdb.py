import os
from pathlib import Path
from dotenv import load_dotenv
import httpx

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

TMDB_BASE_URL = "https://api.themoviedb.org/3"

async def tmdb_get(endpoint: str, params: dict = None):
    if params is None:
        params = {}
    params["api_key"] = TMDB_API_KEY

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{TMDB_BASE_URL}{endpoint}", params=params)
        return response.json()