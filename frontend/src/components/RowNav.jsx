function RowNav({ canLeft, canRight, onPrev, onNext }) {
  return (
    <div className="row-nav">
      <button
        className="row-nav-btn"
        onClick={onPrev}
        disabled={!canLeft}
        aria-label="Прокрутити ліворуч"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        className="row-nav-btn"
        onClick={onNext}
        disabled={!canRight}
        aria-label="Прокрутити праворуч"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}

export default RowNav;