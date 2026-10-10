import { useEffect, useState } from "react";
import { TMDB_IMAGE_URL, STATUSES } from "../constants";

function MyListScreen({
  myMovies,
  filterStatus,
  onFilterChange,
  onOpenMovie,
  onChangeStatus,
  onDelete,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const filteredMovies = myMovies.filter((movie) => movie.status === filterStatus);

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

      {filteredMovies.length === 0 ? (
        <p className="placeholder-text">Нічого не знайдено у цій категорії</p>
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
              <div className="list-card-meta">
                {movie.user_rating ? (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '14px', verticalAlign: 'middle', color: '#ffc107' }}
                    >
                      star
                    </span>{' '}
                    {movie.user_rating}/10
                  </>
                ) : (
                  'Без оцінки'
                )}
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