const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : '');
export const API_URL = `${API_BASE_URL.replace(/\/$/, '')}/api`;
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

export const GENRE_NAMES = {
  28: "Бойовик",
  12: "Пригоди",
  16: "Мультфільм",
  35: "Комедія",
  80: "Кримінал",
  99: "Документальний",
  18: "Драма",
  10751: "Сімейний",
  14: "Фентезі",
  36: "Історичний",
  27: "Жахи",
  10402: "Музика",
  9648: "Детектив",
  10749: "Мелодрама",
  878: "Фантастика",
  10770: "Телефільм",
  53: "Трилер",
  10752: "Військовий",
  37: "Вестерн",
};