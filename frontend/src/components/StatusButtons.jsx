import { STATUSES } from "../constants";

function StatusButtons({ currentStatus, onSelect }) {
  return (
    <div className="status-row">
      {Object.entries(STATUSES).map(([key, { label, icon }]) => (
        <button
          key={key}
          className={`status-button ${currentStatus === key ? 'active' : ''}`}
          onClick={() => onSelect(key)}
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className="status-button-label">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default StatusButtons;