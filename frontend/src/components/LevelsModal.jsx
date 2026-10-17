import { useRef, useState } from "react";
import { LEVELS, getLevelInfo } from "../levels";

function pluralFilms(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "фільм";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "фільми";
  return "фільмів";
}

function LevelsModal({ watchedCount, currentLevel, onClose }) {

  const { current, next, progress, done, range } = getLevelInfo(watchedCount);

  const touchStartY = useRef(null);

  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (diff > 60) handleClose();
  };

  return (
    <div className={`levels-overlay ${closing ? "closing" : ""}`} onClick={handleClose}>
      <div
        className={`levels-sheet ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="levels-sheet-top">
          <div
            className="levels-handle-zone"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="levels-handle" />
          </div>

          <div className="levels-sheet-header">
            <div className="levels-sheet-title">Рівні</div>
            <button className="levels-close" onClick={handleClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="levels-hero">
          <div className="levels-hero-top">
            <div className="levels-hero-number">{currentLevel}</div>
            <div className="levels-hero-titles">
              <div className="levels-hero-label">Рівень</div>
              <div className="levels-hero-name">{current.name}</div>
            </div>
          </div>

          {next ? (
            <>
              <div className="levels-hero-bar">
                <div className="levels-hero-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="levels-hero-caption">
                {done} / {range} · до рівня «{next.name}»
              </div>
            </>
          ) : (
            <div className="levels-hero-caption">Максимальний рівень</div>
          )}
        </div>

        <div className="levels-path">
          {LEVELS.map((lvl, index) => {
            const levelNumber = index + 1;
            const reached = watchedCount >= lvl.minWatched;
            const isCurrent = levelNumber === currentLevel;
            const left = lvl.minWatched - watchedCount;

            let note = `Ще ${left} ${pluralFilms(left)}`;
            if (isCurrent) note = "Ви тут";
            else if (reached) note = "";

            return (
              <div
                key={lvl.name}
                className={`path-item ${reached ? "reached" : "locked"} ${isCurrent ? "current" : ""}`}
              >
                <div className="path-node" />
                <div className="path-info">
                  <div className="path-name">{lvl.name}</div>
                  <div className="path-req">
                    від {lvl.minWatched} {pluralFilms(lvl.minWatched)}
                  </div>
                </div>
                {note && <div className="path-note">{note}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LevelsModal;