import os
import httpx
from sqlalchemy.orm import Session
import models

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

async def fix_missing_runtimes(get_db_func):
    db: Session = next(get_db_func())
    try:
        movies_to_update = db.query(models.Movie).filter(
            (models.Movie.runtime == None) | (models.Movie.runtime == 0)
        ).all()

        if not movies_to_update:
            return

        print(f"Знайдено {len(movies_to_update)} фільмів без runtime. Оновлюємо...")

        async with httpx.AsyncClient() as client:
            for movie in movies_to_update:
                try:
                    response = await client.get(
                        f"https://api.themoviedb.org/3/movie/{movie.tmdb_id}",
                        params={"api_key": TMDB_API_KEY},
                    )
                    if response.status_code == 200:
                        details = response.json()
                        runtime = details.get("runtime")
                        if runtime:
                            movie.runtime = runtime
                except Exception as e:
                    print(f"Помилка оновлення для tmdb_id {movie.tmdb_id}: {e}")

        db.commit()
        print("Оновлення старих фільмів завершено успішно!")
    finally:
        db.close()