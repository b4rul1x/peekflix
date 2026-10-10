import { STATUSES, STATUS_COLORS } from "../constants";

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart({ stats, selectedKey, onSelect }) {
  const hasData = stats && stats.total_runtime_minutes > 0;

  const selected = stats?.by_status?.find((s) => s.status === selectedKey);
  const totalMinutes = selected ? selected.runtime_minutes : (stats?.total_runtime_minutes || 0);
  const hours = Math.round(totalMinutes / 60);

  let cumulative = 0;
  const segments = hasData
    ? stats.by_status.map(({ status, percentage }) => {
        if (percentage <= 0) return null;
        const dash = (percentage / 100) * CIRCUMFERENCE;
        const offset = -(cumulative / 100) * CIRCUMFERENCE;
        cumulative += percentage;

        return (
          <circle
            key={status}
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={STATUS_COLORS[status] || '#888'}
            strokeWidth={selectedKey === status ? 26 : 22}
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            strokeDashoffset={offset}
            className="donut-segment"
            onClick={() => onSelect(status)}
          />
        );
      })
    : null;

  return (
    <div className="donut-chart-wrapper">
      <svg viewBox="0 0 180 180" className="donut-chart">
        <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="#252538" strokeWidth="22" />
        <g transform="rotate(-90 90 90)">{segments}</g>
      </svg>
      <div className="donut-center">
        <div className="donut-center-value">{hours} год</div>
        <div className="donut-center-label">
          {selected ? (STATUSES[selected.status]?.label ?? selected.status) : 'Загалом'}
        </div>
      </div>
    </div>
  );
}

export default DonutChart;