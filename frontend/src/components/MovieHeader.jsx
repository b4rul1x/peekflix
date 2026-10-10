import { TMDB_IMAGE_URL } from "../constants";
import { getCountryName } from "../utils";

function MovieHeader({ movie, onOpenFilter, onOpenPerson }) {
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
      </div>

      <div className="movie-info">
        <div className="title-row">
          <div className="movie-title">{movie.title}</div>
          <span className="rating-badge">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>
            {movie.vote_average?.toFixed(1)}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Рік випуску</span>
          <div className="chip-group">
            {year && (
              <button
                className="chip chip-clickable"
                onClick={() => onOpenFilter(`Фільми ${year} року`, { year })}
              >
                {year}
              </button>
            )}
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">Країна</span>
          <div className="chip-group">
            {movie.countries?.map((country) => {
              const countryName = getCountryName(country.code, country.name);
              return (
                <button
                  key={country.code}
                  className="chip chip-clickable"
                  onClick={() => onOpenFilter(`Країна: ${countryName}`, { country: country.code })}
                >
                  {countryName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">Жанр</span>
          <div className="chip-group">
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

        <div className="info-row">
          <span className="info-label">Тривалість</span>
          <div className="chip-group">
            <span className="chip">{movie.runtime} хв</span>
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">Режисер</span>
          <div className="chip-group">
            {movie.director && (
              <button
                className="chip chip-clickable"
                onClick={() => onOpenPerson(movie.director.id)}
              >
                {movie.director.name}
              </button>
            )}
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">У головних ролях</span>
          <div className="chip-group">
            {movie.cast?.map((actor) => (
              <button
                key={actor.id}
                className="chip chip-clickable"
                onClick={() => onOpenPerson(actor.id)}
              >
                {actor.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieHeader;