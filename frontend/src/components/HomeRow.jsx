import PosterCard from "./PosterCard";

function HomeRow({ title, movies, onMovieClick, onSeeAll, getStatusIcon }) {
  return (
    <div className="home-row">
      <div className="row-header">
        <div className="row-title">{title}</div>
        {onSeeAll && (
          <button className="row-see-all" onClick={onSeeAll}>
            Усі
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              chevron_right
            </span>
          </button>
        )}
      </div>

      <div className="row-scroll">
        {movies.slice(0, 10).map((movie, index) => (
          <PosterCard
            key={movie.tmdb_id ?? movie.id ?? index}
            movie={movie}
            onClick={() => onMovieClick(movie)}
            statusIcon={getStatusIcon ? getStatusIcon(movie) : null}
          />
        ))}
      </div>
    </div>
  );
}

export default HomeRow;