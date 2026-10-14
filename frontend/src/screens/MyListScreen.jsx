import { useEffect, useState } from "react";
import { TMDB_IMAGE_URL, STATUSES } from "../constants";
import PosterCard from "../components/PosterCard";

const SORT_OPTIONS = [
  { key: 'recent', label: 'Нещодавно додані', short: 'Нові' },
  { key: 'userRating', label: 'За моєю оцінкою', short: 'Моя оцінка' },
  { key: 'tmdbRating', label: 'За рейтингом TMDB', short: 'Рейтинг' },
  { key: 'year', label: 'За роком виходу', short: 'Рік' },
  { key: 'title', label: 'За назвою', short: 'Назва' },
];

const SORT_FNS = {
  recent: (a, b) => b.id - a.id,
  userRating: (a, b) => (b.user_rating || 0) - (a.user_rating || 0),
  tmdbRating: (a, b) => (b.vote_average || 0) - (a.vote_average || 0),
  year: (a, b) => (b.release_date || '').localeCompare(a.release_date || ''),
  title: (a, b) => a.title.localeCompare(b.title, 'uk'),
};

function formatRuntime(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} г${m ? ` ${m} хв` : ''}` : `${m} хв`;
}

function getMeta(movie) {
  return [movie.release_date?.slice(0, 4), formatRuntime(movie.runtime)]
    .filter(Boolean)
    .join(' · ');
}

function MyListScreen({
  myMovies,
  filterStatus,
  onFilterChange,
  onOpenMovie,
  onChangeStatus,
  onDelete,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('recent');
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    if (!sortOpen) return;
    const close = () => setSortOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [sortOpen]);

  const filteredMovies = myMovies
    .filter((movie) => movie.status === filterStatus)
    .sort(SORT_FNS[sortBy]);

  return (
    <div>
      <div className="status-filter-bar">
        {Object.entries(STATUSES).map(([key, { label, icon }]) => {
          const isActive = filterStatus === key;
          return (
            <button
              key={key}
              className={`filter-chip ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange(key)}
              title={label}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {isActive && <span className="chip-label">{label}</span>}
            </button>
          );
        })}
      </div>

      <div className="list-toolbar">
        <span className="list-count">Фільмів: {filteredMovies.length}</span>
        <div className="list-toolbar-right">
          <div className="sort-wrap" onClick={(e) => e.stopPropagation()}>
            <button className="sort-btn" onClick={() => setSortOpen((prev) => !prev)}>
              <span className="material-symbols-outlined">swap_vert</span>
              {SORT_OPTIONS.find((option) => option.key === sortBy).short}
            </button>
            {sortOpen && (
              <div className="sort-menu">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    className={`sort-menu-item ${option.key === sortBy ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy(option.key);
                      setSortOpen(false);
                    }}
                  >
                    {option.label}
                    {option.key === sortBy && (
                      <span className="material-symbols-outlined">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={`view-toggle ${viewMode === 'grid' ? 'is-grid' : ''}`}>
            <span className="view-toggle-thumb" />
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span className="material-symbols-outlined">view_agenda</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-state-icon">
            {STATUSES[filterStatus]?.icon}
          </span>
          <div className="empty-state-title">Тут поки порожньо</div>
          <div className="empty-state-text">
            {myMovies.length === 0
              ? 'Знайди свій перший фільм і додай його до списку'
              : `У категорії «${STATUSES[filterStatus]?.label}» ще немає фільмів`}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="expanded-grid my-list-grid">
          {filteredMovies.map((movie, index) => (
            <PosterCard
              key={`${movie.id}-${sortBy}`}
              movie={movie}
              onClick={() => onOpenMovie(movie)}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            />
          ))}
        </div>
      ) : (
        filteredMovies.map((movie) => (
          <div key={movie.id} className="list-card" onClick={() => onOpenMovie(movie)}>
            {movie.poster_path && (
              <img
                className="list-card-poster"
                src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                alt={movie.title}
              />
            )}
            <div className="list-card-info">
              <div className="list-card-title">{movie.title}</div>
              {getMeta(movie) && (
                <div className="list-card-meta">{getMeta(movie)}</div>
              )}
              <div className="list-card-ratings">
                {movie.vote_average > 0 && (
                  <span className="rating-tmdb">
                    <span className="material-symbols-outlined">star</span>
                    {movie.vote_average.toFixed(1)}
                  </span>
                )}
                {movie.user_rating ? (
                  <span className="rating-user">Моя {movie.user_rating}/10</span>
                ) : null}
              </div>
            </div>
            <div className="list-card-actions" onClick={(e) => e.stopPropagation()}>
              <div className="card-actions-menu">
                {openMenuId === movie.id && (
                  <>
                    {Object.entries(STATUSES).map(([key, { icon, label }]) => (
                      <button
                        key={key}
                        className={`card-actions-menu-item card-actions-menu-item-anim ${key === movie.status ? 'active' : ''}`}
                        title={label}
                        onClick={() => {
                          if (key === movie.status) return;
                          onChangeStatus(movie.id, key);
                          setOpenMenuId(null);
                        }}
                      >
                        <span className="material-symbols-outlined">{icon}</span>
                      </button>
                    ))}
                    <button
                      className="card-actions-menu-item card-actions-menu-item-anim card-actions-menu-delete"
                      title="Видалити"
                      onClick={() => {
                        onDelete(movie.id);
                        setOpenMenuId(null);
                      }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </>
                )}
                <button
                  className="card-actions-menu-item"
                  onClick={() => setOpenMenuId((prev) => (prev === movie.id ? null : movie.id))}
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyListScreen;