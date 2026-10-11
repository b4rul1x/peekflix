import { TMDB_IMAGE_URL } from "../constants";

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} хв`;
  return rest ? `${hours} г ${rest} хв` : `${hours} г`;
}

function MovieHeader({ movie, onOpenFilter }) {
  const year = movie.release_date?.slice(0, 4);

  return (
    <div className="movie-header">
      <div className="poster-column">
        {movie.poster_path && (
          <img
            className="movie-poster"
            src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
            alt={movie.title}
          />
        )}
        <span className="rating-badge">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>
          {movie.vote_average?.toFixed(1)}
        </span>
      </div>

      <div className="movie-info">
        <div className="movie-title">{movie.title}</div>

        <div className="movie-meta">
          {year && (
            <button
              className="year-link"
              onClick={() => onOpenFilter(`Фільми ${year} року`, { year })}
            >
              {year}
            </button>
          )}
          {year && movie.runtime ? <span>·</span> : null}
          {movie.runtime ? <span>{formatRuntime(movie.runtime)}</span> : null}
        </div>

        <div className="genre-row">
          {movie.genres?.map((genre) => (
            <button
              key={genre.id}
              className="chip chip-clickable"
              onClick={() => onOpenFilter(`Жанр: ${genre.name}`, { genre_id: genre.id })}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieHeader;