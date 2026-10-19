export function pluralDays(n) {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return "день";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "дні";
  return "днів";
}

export function getReleaseLabel(dateStr) {
  if (!dateStr) return null;

  const [y, m, d] = dateStr.split("-").map(Number);
  const release = new Date(y, m - 1, d);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const days = Math.round((release - today) / 86400000);

  if (days < 0) return null;
  if (days === 0) return "Сьогодні";
  if (days === 1) return "Завтра";
  if (days <= 30) return `Через ${days} ${pluralDays(days)}`;

  return release.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return null;

  const [y, m, d] = dateStr.split("-").map(Number);
  const release = new Date(y, m - 1, d);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const days = Math.round((release - today) / 86400000);
  return days < 0 ? null : days;
}