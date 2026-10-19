import { useEffect, useRef, useState } from "react";
import HeroCard from "./HeroCard";

const AUTOPLAY_MS = 6000;

function HeroCarousel({ movies, onOpenDetails }) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    if (movies.length < 2) return;

    const timer = setInterval(() => {
      if (pausedRef.current) return;
      const el = trackRef.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      goTo((current + 1) % movies.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [movies.length]);

  return (
    <div className="hero-carousel">
      <div
        className="hero-track"
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => (pausedRef.current = true)}
        onTouchEnd={() => (pausedRef.current = false)}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        {movies.map((movie) => (
          <div className="hero-slide" key={movie.id}>
            <HeroCard movie={movie} onClick={() => onOpenDetails(movie.id)} />
          </div>
        ))}
      </div>

      {movies.length > 1 && (
        <div className="hero-dots">
          {movies.map((movie, i) => (
            <button
              key={movie.id}
              className={`hero-dot${i === index ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroCarousel;