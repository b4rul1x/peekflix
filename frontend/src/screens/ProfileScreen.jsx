import { useState } from "react";
import DonutChart from "../components/DonutChart";
import { TMDB_IMAGE_URL, STATUSES, STATUS_COLORS } from "../constants";

function ProfileScreen({ username, userPhoto, profileStats, recentMovies, onOpenMovie }) {
  const [selectedStatKey, setSelectedStatKey] = useState(null);

  const toggleStat = (key) => setSelectedStatKey((prev) => (prev === key ? null : key));

  return (
    <div className="profile-screen">
      <div className="profile-user-card">
        {userPhoto ? (
          <img className="profile-avatar" src={userPhoto} alt={username} />
        ) : (
          <div className="profile-avatar profile-avatar-placeholder">
            <span className="material-symbols-outlined">person</span>
          </div>
        )}
        <div className="profile-user-info">
          <div className="profile-name">{username}</div>
          <div className="profile-badge">Кіноман</div>
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
    </div>
  );
}

export default ProfileScreen;