import { useEffect, useState } from "react";
import MovieHeader from "../components/MovieHeader";
import TrailerModal from "../components/TrailerModal";
import CollectionWidget from "../components/CollectionWidget";
import StatusButtons from "../components/StatusButtons";
import UserRating from "../components/UserRating";
import HomeRow from "../components/HomeRow";
import { fetchJson } from "../api";

function MovieDetailScreen({
  movie,
  onBack,
  onOpenFilter,
  onOpenPerson,
  onChangeStatus,
  onAddMovie,
  onSaveRating,
  onMovieClick,
  getStatusIcon,
}) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState([]);

  useEffect(() => {
    if (!movie.tmdb_id) return;

    let cancelled = false;
    fetchJson(`/movie/${movie.tmdb_id}/similar`, 'Не вдалось завантажити схожі фільми:')
      .then((data) => {
        if (!cancelled && data) setRelatedMovies(data);
      })
      .catch((error) => console.error('Не вдалось завантажити схожі фільми:', error));

    return () => {
      cancelled = true;
    };
  }, [movie.tmdb_id]);

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Назад
        </button>
      </div>

      <MovieHeader movie={movie} onOpenFilter={onOpenFilter} onOpenPerson={onOpenPerson} />

      {movie.trailer_key && (
        <button className="trailer-button" onClick={() => setShowTrailer(true)}>
          <span className="material-symbols-outlined">play_circle</span>
          Дивитись трейлер
        </button>
      )}

      {movie.collection_id && (
        <CollectionWidget
          collectionId={movie.collection_id}
          collectionName={movie.collection_name}
          onMovieClick={onMovieClick}
          getStatusIcon={getStatusIcon}
        />
      )}

      <StatusButtons
        currentStatus={movie.status}
        onSelect={(key) =>
          movie.status ? onChangeStatus(movie.id, key) : onAddMovie(movie, key)
        }
      />

      {movie.id && (
        <UserRating
          rating={movie.user_rating}
          onSave={(star) => onSaveRating(movie.id, star)}
        />
      )}

      <p className="overview-text-full">{movie.overview}</p>

      {relatedMovies.length > 0 && (
        <div className="related-section">
          <HomeRow
            title="Схожі фільми"
            movies={relatedMovies}
            onMovieClick={onMovieClick}
            getStatusIcon={getStatusIcon}
          />
        </div>
      )}

      {showTrailer && movie.trailer_key && (
        <TrailerModal trailerKey={movie.trailer_key} onClose={() => setShowTrailer(false)} />
      )}
    </div>
  );
}

export default MovieDetailScreen;