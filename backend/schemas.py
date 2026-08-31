from pydantic import BaseModel

class MovieCreate(BaseModel):
    tmdb_id: int
    title: str
    poster_path: str | None = None
    user_id: int
    status: str = "watched"