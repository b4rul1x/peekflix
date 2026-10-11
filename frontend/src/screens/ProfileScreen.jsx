import { useState } from "react";
import DonutChart from "../components/DonutChart";
import LevelsModal from "../components/LevelsModal";
import { TMDB_IMAGE_URL, STATUSES, STATUS_COLORS } from "../constants";
import { getLevelInfo } from "../levels";

function ProfileScreen({ username, userPhoto, profileStats, recentMovies, onOpenMovie }) {
  const [selectedStatKey, setSelectedStatKey] = useState(null);
  const [levelsOpen, setLevelsOpen] = useState(false);

  const toggleStat = (key) => setSelectedStatKey((prev) => (prev === key ? null : key));

  const COUNTED_STATUSES = ["watched", "favorite"];

  const watchedCount = (profileStats?.by_status ?? [])
    .filter((s) => COUNTED_STATUSES.includes(s.status))
    .reduce((sum, s) => sum + s.count, 0);

  const { current, next, progress, done, range, level } = getLevelInfo(watchedCount);

  return (
    <div className="profile-screen">
      <div className="profile-card profile-header">
        <div className="profile-header-top">
          {userPhoto ? (
            <img className="profile-avatar" src={userPhoto} alt={username} />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">
              <span className="material-symbols-outlined">person</span>
            </div>
          )}
          <div className="profile-header-info">
            <div className="profile-header-name">{username}</div>
            <div className="profile-level-chip" onClick={() => setLevelsOpen(true)}>
              <span className="material-symbols-outlined">military_tech</span>
              Рівень {level} · {current.name}
            </div>
          </div>
        </div>

        <div className="level-progress" onClick={() => setLevelsOpen(true)}>
          <div className="level-progress-bar">
            <div className="level-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="level-progress-row">
            {next ? (
              <>
                <span>{done} / {range}</span>
                <span>До рівня «{next.name}»</span>
              </>
            ) : (
              <span>Максимальний рівень</span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-title">
          <span className="material-symbols-outlined">bar_chart</span>
          Аналітика переглядів
        </div>

        <div className="stats-container-row">
          <DonutChart stats={profileStats} selectedKey={selectedStatKey} onSelect={toggleStat} />

          <div className="stats-legend-compact">
            {Object.entries(STATUSES).map(([statusKey, { label, icon }]) => {
              const statData = profileStats?.by_status?.find((s) => s.status === statusKey);
              const count = statData ? statData.count : 0;

              return (
                <div
                  key={statusKey}
                  className={`stats-legend-item-compact ${selectedStatKey === statusKey ? 'active' : ''}`}
                  onClick={() => toggleStat(statusKey)}
                >
                  <div className="legend-item-left">
                    <span
                      className="material-symbols-outlined status-icon-sm"
                      style={{ color: STATUS_COLORS[statusKey] || '#888' }}
                    >
                      {icon}
                    </span>
                    <span className="stats-legend-label-sm">{label}</span>
                  </div>
                  <span className="stats-legend-count-sm">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-title">
          <span className="material-symbols-outlined">history</span>
          Історія перегляду
        </div>

        {recentMovies.length === 0 ? (
          <p className="placeholder-text">Список поки порожній</p>
        ) : (
          <div className="recent-movies-list">
            {recentMovies.map((movie) => (
              <div
                key={movie.id}
                className="list-card recent-card"
                onClick={() => onOpenMovie(movie)}
              >
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
                    {STATUSES[movie.status]?.label ?? movie.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {levelsOpen && (
        <LevelsModal
          watchedCount={watchedCount}
          currentLevel={level}
          onClose={() => setLevelsOpen(false)}
        />
      )}
    </div>
  );
}

export default ProfileScreen;