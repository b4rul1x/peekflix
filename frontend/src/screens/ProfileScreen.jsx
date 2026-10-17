import { useState } from "react";
import DonutChart from "../components/DonutChart";
import LevelsModal from "../components/LevelsModal";
import { TMDB_IMAGE_URL, STATUSES, STATUS_COLORS } from "../constants";
import { getLevelInfo } from "../levels";

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProfileScreen({ username, userPhoto, profileStats, recentMovies, onOpenMovie }) {
  const [selectedStatKey, setSelectedStatKey] = useState(null);
  const [levelsOpen, setLevelsOpen] = useState(false);

  const toggleStat = (key) => setSelectedStatKey((prev) => (prev === key ? null : key));

  const COUNTED_STATUSES = ["watched", "favorite"];

  const watchedCount = (profileStats?.by_status ?? [])
    .filter((s) => COUNTED_STATUSES.includes(s.status))
    .reduce((sum, s) => sum + s.count, 0);

  const { current, next, progress, done, range, level } = getLevelInfo(watchedCount);
  const totalCount = (profileStats?.by_status ?? []).reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="profile-screen">
      <div className="profile-card profile-header">
        <div className="profile-avatar-ring">
          <svg viewBox="0 0 104 104" className="profile-ring-svg">
            <circle className="profile-ring-track" cx="52" cy="52" r={RING_RADIUS} />
            <circle
              className="profile-ring-fill"
              cx="52"
              cy="52"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
            />
          </svg>
          {userPhoto ? (
            <img className="profile-avatar" src={userPhoto} alt={username} />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">
              <span className="material-symbols-outlined">person</span>
            </div>
          )}
        </div>

        <div className="profile-header-name">{username}</div>

        <div className="profile-level-chip" onClick={() => setLevelsOpen(true)}>
          <span className="material-symbols-outlined">military_tech</span>
          Рівень {level} · {current.name}
        </div>

        <div className="profile-level-caption" onClick={() => setLevelsOpen(true)}>
          {next ? `${done} / ${range} · до рівня «${next.name}»` : "Максимальний рівень"}
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-title">
          <span className="material-symbols-outlined">bar_chart</span>
          Аналітика переглядів
        </div>

        <div className="stats-container-row">
          <DonutChart stats={profileStats} selectedKey={selectedStatKey} onSelect={toggleStat} />

          <div className="stats-legend-grid">
            {Object.entries(STATUSES).map(([statusKey, { label, icon }]) => {
              const statData = profileStats?.by_status?.find((s) => s.status === statusKey);
              const count = statData ? statData.count : 0;

              return (
                <div
                  key={statusKey}
                  style={{ '--c': STATUS_COLORS[statusKey] || '#888' }}
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
        {totalCount === 0 && (
          <div className="stats-empty">
            <span className="material-symbols-outlined">movie</span>
            <div className="stats-empty-title">Статистики поки немає</div>
            <div className="stats-empty-text">
              Позначте фільм як переглянутий, і тут з'явиться діаграма вашого часу
            </div>
          </div>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-card-title">
          <span className="material-symbols-outlined">history</span>
          Остання активність
        </div>

        {recentMovies.length === 0 ? (
          <div className="stats-empty">
            <span className="material-symbols-outlined">history</span>
            <div className="stats-empty-title">Активності поки немає</div>
            <div className="stats-empty-text">
              Додані фільми та зміни їхніх статусів з'являться тут
            </div>
          </div>
        ) : (
          <div className="recent-movies-list">
            {recentMovies.map((movie) => {
              const year = movie.release_date?.slice(0, 4);
              const rating = Number(movie.vote_average);
              const statusInfo = STATUSES[movie.status];

              return (
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

                    {(year || rating > 0) && (
                      <div className="recent-card-meta">
                        {year && <span>{year}</span>}
                        {year && rating > 0 && <span>·</span>}
                        {rating > 0 && (
                          <span className="recent-card-rating">
                            <span className="material-symbols-outlined">star</span>
                            {rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="recent-card-status">
                      <span className="material-symbols-outlined">{statusInfo?.icon}</span>
                      {statusInfo?.label ?? movie.status}
                    </div>
                  </div>
                </div>
              );
            })}
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