import { TMDB_IMAGE_URL } from "../constants";
import RowNav from "./RowNav";
import { useRowScroll } from "../hooks/useRowScroll";
import { useDragScroll } from "../hooks/useDragScroll";

function Top10Row({ movies, onMovieClick, onSeeAll }) {
  const { ref, canLeft, canRight, update, scrollByPage } = useRowScroll([movies]);

  const top = movies.slice(0, 10);
  useDragScroll(ref, [top.length > 0]);
  if (top.length === 0) return null;

  return (
    <div className="home-row">
        <div className="row-header">
          <div className="row-title">Топ-10 тижня</div>
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

      <div className="top10-track drag-scroll" ref={ref} onScroll={update}>
        {top.map((movie, i) => (
          <button
            key={movie.id}
            className={`top10-item${i === 9 ? " wide" : ""}`}
            onClick={() => onMovieClick(movie)}
          >
            <span className={`top10-num${i === 0 ? " first" : ""}`}>
              {i + 1}
            </span>
            <div className="top10-poster-wrap">
                {movie.poster_path && (
                    <img
                    className="top10-poster"
                    src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    loading="lazy"
                    />
                )}
                {movie.vote_average > 0 && (
                    <div className="poster-rating-badge">
                    <span className="material-symbols-outlined">star</span>
                    {movie.vote_average.toFixed(1)}
                    </div>
                )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Top10Row;