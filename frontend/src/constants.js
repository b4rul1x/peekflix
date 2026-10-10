export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : 'https://peekflix-api.x0ryz.dev');
export const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w200';
export const TMDB_PROFILE_URL = 'https://image.tmdb.org/t/p/w185';

export const STATUSES = {
  watching: { label: 'Дивлюся', icon: 'visibility' },
  planned: { label: 'Заплановано', icon: 'bookmark' },
  watched: { label: 'Переглянуто', icon: 'check_circle' },
  dropped: { label: 'Покинуто', icon: 'cancel' },
  paused: { label: 'Відкладено', icon: 'pause_circle' },
  favorite: { label: 'Улюблене', icon: 'favorite' },
};

export const STATUS_COLORS = {
  watching: '#4FC3F7',
  planned: '#AB47BC',
  watched: '#66BB6A',
  dropped: '#EF5350',
  paused: '#FFA726',
  favorite: '#EC407A',
};

export const GENRE = { id: 28, title: 'Бойовики' };

export const CATEGORY_ENDPOINTS = {
  trending: { title: 'Зараз популярне', url: '/home/trending' },
  topRated: { title: 'Топ за рейтингом', url: '/home/top-rated' },
  nowPlaying: { title: 'Новинки', url: '/home/now-playing' },
  genre: { title: GENRE.title, url: `/home/by-genre?genre_id=${GENRE.id}` },
};