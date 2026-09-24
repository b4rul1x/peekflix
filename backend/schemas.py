from pydantic import BaseModel

class MovieCreate(BaseModel):
    tmdb_id: int
    title: str
    poster_path: str | None = None
    user_id: int
    status: str = "watched"
    runtime: int | None = None

class MovieDetailsUpdate(BaseModel):
    user_rating: int | None = None