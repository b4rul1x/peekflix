import { TMDB_IMAGE_URL } from "../constants";

function PosterCard({ movie, onClick, statusIcon }) {
  return (
    <div className="poster-card" onClick={onClick}>
      {movie.poster_path && (
        <img
          className="poster-card-image"
          src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
          alt={movie.title}
        />
      )}
      {statusIcon && (
        <div className="poster-status-badge" title={statusIcon.label}>
          <span className="material-symbols-outlined">{statusIcon.icon}</span>
        </div>
      )}
      <div className="poster-card-title">{movie.title}</div>
    </div>
  );
}

export default PosterCard;