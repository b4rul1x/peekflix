import PosterCard from "../components/PosterCard";
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
}) {
  const movies = person[tab] ?? [];

  return (
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Назад
        </button>
      </div>

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

      {person.biography ? (
        <>
          <p className={`person-bio ${bioExpanded ? 'expanded' : ''}`}>{person.biography}</p>
          {person.biography.length > 300 && (
            <button className="person-bio-toggle" onClick={onToggleBio}>
              {bioExpanded ? 'Згорнути' : 'Читати далі'}
              <span className="material-symbols-outlined">
                {bioExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          )}
        </>
      ) : (
        <p className="placeholder-text">Біографія відсутня</p>
      )}

      <div className="person-divider" />
      <div className="person-section-title">Фільмографія</div>
      <div className="person-tabs">
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

      <div className="expanded-grid">
        {movies.slice(0, visibleCount).map((movie) => (
          <PosterCard
            key={movie.tmdb_id}
            movie={movie}
            onClick={() => onMovieClick(movie)}
            statusIcon={getStatusIcon(movie)}
          />
        ))}
      </div>

      {movies.length > visibleCount && (
        <button
          className="row-see-all"
          style={{ margin: '16px auto', display: 'block' }}
          onClick={onShowMore}
        >
          Показати ще
        </button>
      )}
    </div>
  );
}

export default PersonScreen;