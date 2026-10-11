import { useEffect, useLayoutEffect, useRef, useState } from "react";
import MovieHeader from "../components/MovieHeader";
import TrailerModal from "../components/TrailerModal";
import CollectionWidget from "../components/CollectionWidget";
import StatusButtons from "../components/StatusButtons";
import UserRating from "../components/UserRating";
import HomeRow from "../components/HomeRow";
import MovieDetailsCard from "../components/MovieDetailsCard";
import { fetchJson } from "../api";
import { TMDB_IMAGE_URL } from "../constants";

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
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [overviewOverflows, setOverviewOverflows] = useState(false);
  const overviewRef = useRef(null);

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

  useLayoutEffect(() => {
    const el = overviewRef.current;
    if (!el) return;

    const check = () => {
      if (overviewExpanded) return;
      setOverviewOverflows(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    window.addEventListener("resize", check);
    document.fonts?.ready.then(check);

    return () => window.removeEventListener("resize", check);
  }, [movie.overview, overviewExpanded]);

  return (
    <div className="detail-screen">
      {movie.poster_path && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(${TMDB_IMAGE_URL}${movie.poster_path})` }}
        />
      )}

      <div className="movie-topbar">
        <button className="back-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Назад
        </button>
        <span className="movie-topbar-title">Peekflix</span>
        <span />
      </div>

      <MovieHeader movie={movie} onOpenFilter={onOpenFilter} onOpenPerson={onOpenPerson} />

      {movie.trailer_key && (
        <button className="trailer-button" onClick={() => setShowTrailer(true)}>
          <span className="material-symbols-outlined">play_circle</span>
          Дивитись трейлер
        </button>
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

      {movie.collection_id && (
        <CollectionWidget
          collectionId={movie.collection_id}
          collectionName={movie.collection_name}
          currentTmdbId={movie.tmdb_id}
          onMovieClick={onMovieClick}
          getStatusIcon={getStatusIcon}
        />
      )}

      {movie.overview && (
        <div className="overview-block">
          <p
            ref={overviewRef}
            className={`overview-text-full ${overviewExpanded ? "expanded" : ""}`}
          >
            {movie.overview}
          </p>
          {overviewOverflows && (
            <button
              className="overview-toggle"
              onClick={() => setOverviewExpanded((v) => !v)}
            >
              {overviewExpanded ? "Згорнути" : "Читати далі"}
              <span className="material-symbols-outlined">
                {overviewExpanded ? "expand_less" : "expand_more"}
              </span>
            </button>
          )}
        </div>
      )}

      <MovieDetailsCard
        movie={movie}
        onOpenFilter={onOpenFilter}
        onOpenPerson={onOpenPerson}
      />

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