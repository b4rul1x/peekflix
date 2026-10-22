import PosterCard from "../components/PosterCard";
import { useRef, useState, useEffect } from "react";
import { TMDB_PROFILE_URL } from "../constants";
import { formatDate } from "../utils";

function PersonScreen({
  person,
  tab,
  onTabChange,
  bioExpanded,
  onToggleBio,
  visibleCount,
  onShowMore,
  onBack,
  onMovieClick,
  getStatusIcon,
  onSetStatus,
}) {

  const bioRef = useRef(null);

  const [openStatusId, setOpenStatusId] = useState(null);

  useEffect(() => {
    if (openStatusId === null) return;
    const close = () => setOpenStatusId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openStatusId]);

  const isLongBio = (person.biography?.length ?? 0) > 300;

  const hasBoth = person.directed.length > 0 && person.acted.length > 0;

  const movies = person[tab] ?? [];

  return (
    <div className="detail-screen person-screen">
      {person.profile_path && (
        <div className="detail-backdrop">
          <div
            className="detail-backdrop-image"
            style={{ backgroundImage: `url(${TMDB_PROFILE_URL}${person.profile_path})` }}
          />
        </div>
      )}
      
      <div className="movie-topbar">
        <button className="back-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Назад
        </button>
        <div className="movie-topbar-title">Peekflix</div>
      </div>

      <div className="person-layout">
        <div className="person-header">
          {person.profile_path ? (
            <img
              className="person-photo"
              src={`${TMDB_PROFILE_URL}${person.profile_path}`}
              alt={person.name}
            />
          ) : (
            <div className="person-photo person-photo-placeholder">
              <span className="material-symbols-outlined">person</span>
            </div>
          )}
          <div className="person-name">{person.name}</div>
          {person.birthday && (
            <div className="person-meta-line">
              {formatDate(person.birthday)}
              {person.deathday && ` — ${formatDate(person.deathday)}`}
            </div>
          )}
          {person.place_of_birth && (
            <div className="person-meta-line">{person.place_of_birth}</div>
          )}
        </div>

        <div className="person-main">
          {person.biography ? (
            <div className="overview-block">
              <p
                ref={bioRef}
                className={`person-bio ${isLongBio ? 'collapsible' : ''} ${isLongBio && !bioExpanded ? 'clamped' : ''}`}
                style={isLongBio && bioExpanded ? { maxHeight: bioRef.current?.scrollHeight } : undefined}
              >
                {person.biography}
              </p>
              {isLongBio && (
                <button className="overview-toggle" onClick={onToggleBio}>
                  {bioExpanded ? 'Згорнути' : 'Читати далі'}
                  <span className="material-symbols-outlined">
                    {bioExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <p className="placeholder-text">Біографія відсутня</p>
          )}

          <div className="person-section-title">Фільмографія</div>
          <div className={`person-tabs ${hasBoth ? 'has-slider' : ''}`}>
            {hasBoth && (
              <div className={`person-tab-slider ${tab === 'acted' ? 'right' : ''}`} />
            )}
            {person.directed.length > 0 && (
              <button
                className={`person-tab ${tab === 'directed' ? 'active' : ''}`}
                onClick={() => onTabChange('directed')}
              >
                Режисер ({person.directed.length})
              </button>
            )}
            {person.acted.length > 0 && (
              <button
                className={`person-tab ${tab === 'acted' ? 'active' : ''}`}
                onClick={() => onTabChange('acted')}
              >
                Актор ({person.acted.length})
              </button>
            )}
          </div>

          <div key={tab} className="expanded-grid person-grid-anim">
            {movies.slice(0, visibleCount).map((movie) => (
              <PosterCard
                key={movie.tmdb_id}
                movie={movie}
                onClick={() => onMovieClick(movie)}
                statusIcon={getStatusIcon(movie)}
                onStatusSelect={(status) => {
                  onSetStatus(movie, status);
                  setOpenStatusId(null);
                }}
                statusMenuOpen={openStatusId === movie.tmdb_id}
                onStatusMenuToggle={() =>
                  setOpenStatusId((prev) =>
                    prev === movie.tmdb_id ? null : movie.tmdb_id
                  )
                }
              />
            ))}
          </div>

          {movies.length > visibleCount && (
            <button className="person-show-more" onClick={onShowMore}>
              Показати ще ({movies.length - visibleCount})
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonScreen;