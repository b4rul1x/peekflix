import PosterCard from "./PosterCard";
import { useEffect, useRef, useState } from "react";

function HomeRow({ title, movies, onMovieClick, onSeeAll, getStatusIcon }) {

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [movies]);

  const scrollByPage = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

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

      <div className="row-scroll-wrap">
        {canScrollLeft && (
          <button
            className="row-arrow row-arrow-left"
            onClick={() => scrollByPage(-1)}
            aria-label="Прокрутити ліворуч"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}

        <div className="row-scroll" ref={scrollRef} onScroll={updateArrows}>
          {movies.slice(0, 10).map((movie, index) => (
            <PosterCard
              key={movie.tmdb_id ?? movie.id ?? index}
              movie={movie}
              onClick={() => onMovieClick(movie)}
              statusIcon={getStatusIcon ? getStatusIcon(movie) : null}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            className="row-arrow row-arrow-right"
            onClick={() => scrollByPage(1)}
            aria-label="Прокрутити праворуч"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default HomeRow;