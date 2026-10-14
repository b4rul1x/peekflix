import { TMDB_IMAGE_URL } from "../constants";

function PosterCard({ movie, onClick, statusIcon, style }) {

  const year = movie.release_date?.slice(0, 4);
  const rating = movie.vote_average;

  return (
    <div className="poster-card" onClick={onClick} style={style}>
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
      {statusIcon && (
        <div className="poster-status-badge" title={statusIcon.label}>
          <span className="material-symbols-outlined">{statusIcon.icon}</span>
        </div>
      )}
      <div className="poster-card-title">{movie.title}</div>
      {year && <div className="poster-card-year">{year}</div>}
    </div>
  );
}

export default PosterCard;