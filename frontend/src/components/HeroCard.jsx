import { TMDB_IMAGE_URL, GENRE_NAMES } from "../constants";

function HeroCard({ movie, onClick }) {
  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average;
  const genre = movie.genres?.[0]?.name ?? GENRE_NAMES[movie.genre_ids?.[0]];

  return (
    <div className="hero-card" onClick={onClick}>
      {movie.poster_path && (
        <div
          className="hero-backdrop"
          style={{ backgroundImage: `url(${TMDB_IMAGE_URL}${movie.poster_path})` }}
        />
      )}

      {movie.poster_path && (
        <img
          className="hero-poster"
          src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
          alt={movie.title}
        />
      )}

      <div className="hero-info">
        <div className="hero-label">Зараз популярне</div>
        <h2 className="hero-title">{movie.title}</h2>

        <div className="hero-meta">
          {rating > 0 && (
            <>
              <span className="material-symbols-outlined">star</span>
              {rating.toFixed(1)}
            </>
          )}
          {[year, genre].filter(Boolean).map((part, index) => (
            <span key={part}>
              {(rating > 0 || index > 0) && "· "}
              {part}
            </span>
          ))}
        </div>

        <button className="hero-button">Детальніше</button>
      </div>
    </div>
  );
}

export default HeroCard;