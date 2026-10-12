import { TMDB_IMAGE_URL, STATUSES, GENRE_NAMES } from "../constants";

function SearchResultCard({
  movie,
  isAdded,
  isMenuOpen,
  onOpen,
  onToggleMenu,
  onAdd,
  detailed = false,
}) {

  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average;
  const genre = GENRE_NAMES[movie.genre_ids?.[0]];

  return (
    <div className="list-card" onClick={onOpen}>
      {movie.poster_path && (
        <img
          className="list-card-poster"
          src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
          alt={movie.title}
        />
      )}
      <div className="list-card-info">
        <div className="list-card-title">{movie.title}</div>
        <div className="list-card-meta result-meta">
          {rating > 0 && (
            <span className="result-rating">
              <span className="material-symbols-outlined">star</span>
              {rating.toFixed(1)}
            </span>
          )}
          {[year, detailed ? genre : null].filter(Boolean).map((part, index) => (
            <span key={part}>
              {(rating > 0 || index > 0) && "· "}
              {part}
            </span>
          ))}
        </div>

        {detailed && movie.overview && (
          <div className="result-overview">{movie.overview}</div>
        )}
      </div>
      <div className="list-card-actions" onClick={(e) => e.stopPropagation()}>
        <div className={`card-actions-menu ${!isAdded && isMenuOpen ? "is-open" : ""}`}>
          {!isAdded &&
            isMenuOpen &&
            Object.entries(STATUSES).map(([key, { icon, label }]) => (
              <button
                key={key}
                className="card-actions-menu-item card-actions-menu-item-anim"
                title={label}
                onClick={() => onAdd(key)}
              >
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          <button
            className={`card-actions-menu-item ${isAdded ? 'active' : ''}`}
            onClick={() => {
              if (isAdded) return;
              onToggleMenu();
            }}
            disabled={isAdded}
          >
            <span className="material-symbols-outlined">
              {isAdded ? 'check_circle' : 'add_circle'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchResultCard;