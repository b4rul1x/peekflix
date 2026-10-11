export const LEVELS = [
  { name: "Новачок",      minWatched: 0 },
  { name: "Глядач",       minWatched: 5 },
  { name: "Любитель",     minWatched: 15 },
  { name: "Кіноман",      minWatched: 30 },
  { name: "Кіноексперт",  minWatched: 60 },
  { name: "Кінокритик",   minWatched: 100 },
  { name: "Легенда",      minWatched: 200 },
];

export function getLevelInfo(watchedCount) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (watchedCount >= LEVELS[i].minWatched) {
      index = i;
    }
  }

  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;

  let progress = 100;
  let done = 0;
  let range = 0;
  if (next) {
    range = next.minWatched - current.minWatched;
    done = watchedCount - current.minWatched;
    progress = Math.round((done / range) * 100);
  }

  return { current, next, progress, done, range, level: index + 1 };
}