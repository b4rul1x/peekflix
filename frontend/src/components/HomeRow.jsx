import PosterCard from "./PosterCard";
import RowNav from "./RowNav";
import { useRowScroll } from "../hooks/useRowScroll";

function HomeRow({ title, movies, onMovieClick, onSeeAll, getStatusIcon }) {

  const { ref, canLeft, canRight, update, scrollByPage } = useRowScroll([movies]);

  return (
    <div className="home-row">
      <div className="row-header">
        <div className="row-title">{title}</div>
        <div className="row-actions">
          {onSeeAll && (
            <button className="row-see-all" onClick={onSeeAll}>
              Усі
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                chevron_right
              </span>
            </button>
          )}
          <RowNav
            canLeft={canLeft}
            canRight={canRight}
            onPrev={() => scrollByPage(-1)}
            onNext={() => scrollByPage(1)}
          />
        </div>
      </div>

      <div className="row-scroll-wrap">
        <div className="row-scroll" ref={ref} onScroll={update}>
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
    </div>
  );
}

export default HomeRow;