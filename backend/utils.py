import os
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import or_
import models

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

async def fix_missing_runtimes(get_db_func):
    db: Session = next(get_db_func())
    try:
        movies_to_update = db.query(models.Movie).filter(
            or_(
                models.Movie.runtime.is_(None),
                models.Movie.runtime == 0,
                models.Movie.release_date.is_(None),
                models.Movie.vote_average.is_(None),
            )
        ).all()

        if not movies_to_update:
            return

        print(f"[MIGRATION] Знайдено {len(movies_to_update)} фільмів без runtime. Оновлюємо...")

        async with httpx.AsyncClient() as client:
            for movie in movies_to_update:
                try:
                    response = await client.get(
                        f"https://api.themoviedb.org/3/movie/{movie.tmdb_id}",
                        params={"api_key": os.getenv("TMDB_API_KEY")},
                    )
                    if response.status_code == 200:
                        details = response.json()
                        runtime = details.get("runtime")
                        movie.runtime = runtime if runtime is not None else 0
                        movie.release_date = details.get("release_date") or ""
                        movie.vote_average = details.get("vote_average") or 0
                    else:
                        print(f"[MIGRATION] TMDB повернув {response.status_code} для tmdb_id {movie.tmdb_id}")
                except Exception as e:
                    print(f"[MIGRATION] Помилка для tmdb_id {movie.tmdb_id}: {e}")

        db.commit()
        print("[MIGRATION] Оновлення старих фільмів завершено успішно!")
    finally:
        db.close()