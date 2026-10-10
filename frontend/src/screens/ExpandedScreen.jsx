import PosterCard from "../components/PosterCard";

function ExpandedScreen({
  title,
  movies,
  hasMore,
  loading,
  onBack,
  onMovieClick,
  onLoadMore,
  getStatusIcon,
}) {
  return (
    <div>
      <div className="expanded-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Назад
        </button>

        <div className="app-header">{title}</div>
      </div>

      <div className="expanded-grid">
        {movies.map((movie, index) => (
          <PosterCard
            key={movie.tmdb_id ?? movie.id ?? index}
            movie={movie}
            onClick={() => onMovieClick(movie)}
            statusIcon={getStatusIcon(movie)}
          />
        ))}
      </div>

      {hasMore && (
        <button
          className="row-see-all"
          style={{ margin: '16px auto', display: 'block' }}
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Завантаження...' : 'Завантажити ще'}
        </button>
      )}
    </div>
  );
}

export default ExpandedScreen;