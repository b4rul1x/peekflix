import { LEVELS } from "../levels";

function pluralFilms(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "фільм";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "фільми";
  return "фільмів";
}

function LevelsModal({ watchedCount, currentLevel, onClose }) {
  return (
    <div className="levels-overlay" onClick={onClose}>
      <div className="levels-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="levels-sheet-header">
          <div className="levels-sheet-title">Рівні</div>
          <button className="levels-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="levels-list">
          {LEVELS.map((lvl, index) => {
            const levelNumber = index + 1;
            const reached = watchedCount >= lvl.minWatched;
            const isCurrent = levelNumber === currentLevel;
            const left = lvl.minWatched - watchedCount;

            let icon = "lock";
            let note = `Ще ${left} ${pluralFilms(left)}`;
            if (isCurrent) {
              icon = "military_tech";
              note = "Ваш рівень";
            } else if (reached) {
              icon = "check_circle";
              note = "Отримано";
            }

            return (
              <div
                key={lvl.name}
                className={`level-item ${reached ? "reached" : "locked"} ${isCurrent ? "current" : ""}`}
              >
                <span className="material-symbols-outlined level-item-icon">{icon}</span>
                <div className="level-item-info">
                  <div className="level-item-name">{lvl.name}</div>
                  <div className="level-item-req">
                    від {lvl.minWatched} {pluralFilms(lvl.minWatched)}
                  </div>
                </div>
                <div className="level-item-note">{note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LevelsModal;