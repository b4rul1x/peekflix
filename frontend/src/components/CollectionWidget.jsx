import { useState } from "react";
import { fetchJson } from "../api";

function CollectionWidget({ collectionId, collectionName, onMovieClick, getStatusIcon }) {
  const [expanded, setExpanded] = useState(false);
  const [parts, setParts] = useState([]);

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    const data = await fetchJson(
      `/collection/${collectionId}`,
      'Не вдалось завантажити колекцію:'
    );
    if (!data) return;
    setParts(data.parts);
    setExpanded(true);
  };

  return (
    <div className="collection-widget">
      <button
        className={`collection-toggle-button ${expanded ? 'expanded' : ''}`}
        onClick={handleToggle}
      >
        <span className="material-symbols-outlined">video_library</span>
        Усі частини «{collectionName}»
        <span
          className="material-symbols-outlined collection-chevron"
          style={{ marginLeft: 'auto' }}
        >
          expand_more
        </span>
      </button>

      <div className={`collection-panel-wrapper ${expanded ? 'expanded' : ''}`}>
        <div className="collection-panel-inner">
          <div className="collection-panel">
            {parts.map((movie) => {
              const statusIcon = getStatusIcon(movie);
              return (
                <div
                  key={movie.tmdb_id}
                  className="collection-item"
                  onClick={() => onMovieClick(movie)}
                >
                  <div className="collection-item-title">{movie.title}</div>
                  <div className="collection-item-meta">
                    <span className="collection-item-status-slot">
                      {statusIcon && (
                        <span
                          className="material-symbols-outlined collection-item-status"
                          title={statusIcon.label}
                        >
                          {statusIcon.icon}
                        </span>
                      )}
                    </span>
                    <span className="collection-item-year-slot">
                      {movie.release_date && (
                        <span className="chip">{movie.release_date.slice(0, 4)}</span>
                      )}
                    </span>
                    <span className="collection-item-rating-slot">
                      {movie.vote_average > 0 && (
                        <span className="chip collection-item-rating">
                          <span className="material-symbols-outlined">star</span>
                          {movie.vote_average.toFixed(1)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollectionWidget;