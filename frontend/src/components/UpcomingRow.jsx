import { getDaysUntil, pluralDays } from "../utils/releaseLabel";

const BACKDROP_URL = "https://image.tmdb.org/t/p/w780";
const POSTER_URL = "https://image.tmdb.org/t/p/w200";

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
  });
}

function UpcomingRow({ movies, onMovieClick }) {
  const items = movies.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <div className="home-row">
      <div className="row-header">
        <div className="row-title">Скоро вийде</div>
      </div>

      <div className="upcoming-list">
        {items.map((movie) => {
          const days = getDaysUntil(movie.release_date);

          return (
            <button
              key={movie.id}
              className="upcoming-card"
              onClick={() => onMovieClick(movie)}
            >
              {movie.backdrop_path && (
                <img
                  className="upcoming-bg"
                  src={`${BACKDROP_URL}${movie.backdrop_path}`}
                  alt=""
                  loading="lazy"
                />
              )}
              <div className="upcoming-shade" />

              {movie.poster_path && (
                <img
                  className="upcoming-poster"
                  src={`${POSTER_URL}${movie.poster_path}`}
                  alt={movie.title}
                  loading="lazy"
                />
              )}

              <div className="upcoming-info">
                <div className="upcoming-title">{movie.title}</div>
                <div className="upcoming-date">{formatDate(movie.release_date)}</div>
              </div>

              {days !== null && (
                <div className="upcoming-count">
                  {days <= 1 ? (
                    <span className="upcoming-count-word">
                      {days === 0 ? "Сьогодні" : "Завтра"}
                    </span>
                  ) : (
                    <>
                      <span className="upcoming-count-num">{days}</span>
                      <span className="upcoming-count-unit">{pluralDays(days)}</span>
                    </>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default UpcomingRow;