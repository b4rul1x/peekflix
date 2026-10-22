import { TMDB_IMAGE_URL, STATUSES } from "../constants";

function PosterCard({
  movie,
  onClick,
  statusIcon,
  style,
  onStatusSelect,
  statusMenuOpen,
  onStatusMenuToggle,
}) {

  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average;

  return (
    <div
      className={`poster-card ${statusMenuOpen ? "menu-open" : ""}`}
      onClick={onClick}
      style={style}
    >
      {movie.poster_path && (
        <img
          className="poster-card-image"
          src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
          alt={movie.title}
        />
      )}
      {rating > 0 && (
        <div className="poster-rating-badge">
          <span className="material-symbols-outlined">star</span>
          {rating.toFixed(1)}
        </div>
      )}
      {onStatusSelect ? (
        <div className="poster-menu-wrap" onClick={(e) => e.stopPropagation()}>
          <div className="card-actions-menu poster-actions-menu">
            <button
              className={`card-actions-menu-item poster-menu-trigger ${statusIcon ? "has-status" : ""}`}
              title={statusIcon ? statusIcon.label : "Додати до списку"}
              onClick={onStatusMenuToggle}
            >
              <span className="material-symbols-outlined">
                {statusIcon ? statusIcon.icon : "add"}
              </span>
            </button>

            {statusMenuOpen &&
              Object.entries(STATUSES).map(([key, s]) => {
                const isActive = statusIcon?.label === s.label;
                return (
                  <button
                    key={key}
                    className={`card-actions-menu-item poster-menu-item-anim ${isActive ? "active" : ""}`}
                    title={s.label}
                    onClick={() => {
                      if (!isActive) onStatusSelect(key);
                    }}
                  >
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ) : (
        statusIcon && (
          <div className="poster-status-badge" title={statusIcon.label}>
            <span className="material-symbols-outlined">{statusIcon.icon}</span>
          </div>
        )
      )}
      <div className="poster-card-title">{movie.title}</div>
      {year && <div className="poster-card-year">{year}</div>}
    </div>
  );
}

export default PosterCard;