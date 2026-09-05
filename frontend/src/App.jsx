import { useEffect, useState } from "react";

const API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : 'https://peekflix-production.up.railway.app';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w200';

function App() {
  const [username, setUsername] = useState('гість');
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  const [myMovies, setMyMovies] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null)

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    if (tg.initDataUnsafe?.user) {
      setUsername(tg.initDataUnsafe.user.first_name);
      setUserId(tg.initDataUnsafe.user.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadMyMovies();
    }
  }, [userId]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      console.error('Помилка запиту:', response.status);
      return;
    }

    const data = await response.json();
    setResults(data);
  };

  const handleAddMovie = async (movie) => {
    const response = await fetch(`${API_URL}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        user_id: userId,
        status: 'watched',
      }),
  });

  if (response.status === 409) {
    setAddedIds((prev) => [...prev, movie.id]);
    return;
  }

  if (!response.ok) {
    console.error('Не вдалось додати фільм:', response.status);
    return;
  }
  
  setAddedIds((prev) => [...prev, movie.id]);
};

const handleOpenDetails = async (tmdbId) => {
  console.log('Клікнули на фільм з id:', tmdbId);

  const response = await fetch(`${API_URL}/movie/${tmdbId}`);

  if (!response.ok) {
    console.error('Не вдалось завантажити деталі:', response.status);
    return;
  }

  const data = await response.json();
  setSelectedMovie(data);
};

const loadMyMovies = async () => {
  if (!userId) return;

  const response = await fetch(`${API_URL}/movies/${userId}`);
  if (!response.ok) {
    console.error('Не вдалось завантажити список:', response.status);
    return;
  }

  const data = await response.json();
  setMyMovies(data);
  setAddedIds(data.map((movie) => movie.tmdb_id));
};

const handleTabChange = (tab) => {
  setActiveTab(tab);
  if (tab === 'mylist') {
    loadMyMovies();
  }
};

const handleDeleteMovie = async (movieId) => {
  const response = await fetch(`${API_URL}/movies/${movieId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.error('Не вдалось видалити фільм:', response.status);
    return;
  }

  setMyMovies((prev) => prev.filter((movie) => movie.id !== movieId));
};

  return (
    <div style={{ padding: '20px' }}>
      {selectedMovie ? (
        <div>
          <button onClick={() => setSelectedMovie(null)}>← Назад</button>

          {selectedMovie.poster_path && (
            <img
              src={`${TMDB_IMAGE_URL}${selectedMovie.poster_path}`}
              alt={selectedMovie.title}
              style={{ width: '150px', borderRadius: '8px', marginTop: '12px' }}
            />
          )}

          <h2>{selectedMovie.title}</h2>

          <p><strong>Рік випуску:</strong> {selectedMovie.release_date?.slice(0, 4)}</p>
          <p><strong>Країна:</strong> {selectedMovie.countries.join(', ')}</p>
          <p><strong>Жанр:</strong> {selectedMovie.genres.join(', ')}</p>
          <p><strong>Тривалість:</strong> {selectedMovie.runtime} хв</p>
          <p><strong>Прем'єра:</strong> {selectedMovie.release_date}</p>
          <p><strong>Рейтинг TMDB:</strong> {selectedMovie.vote_average?.toFixed(1)}</p>
          <p><strong>Режисер:</strong> {selectedMovie.director}</p>
          <p><strong>У головних ролях:</strong> {selectedMovie.cast.join(', ')}</p>
          <p>{selectedMovie.overview}</p>
        </div>
      ) : (
        <>
          <h1>🎬 Peekflix</h1>
          <p>Привіт, {username}!</p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => handleTabChange('search')}
              style={{ fontWeight: activeTab === 'search' ? 'bold' : 'normal' }}
            >
              🔍 Пошук
            </button>
            <button
              onClick={() => handleTabChange('mylist')}
              style={{ fontWeight: activeTab === 'mylist' ? 'bold' : 'normal' }}
            >
              📋 Мої фільми
            </button>
          </div>

          {activeTab === 'search' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Назва фільму..."
                  style={{ flex: 1, padding: '8px' }}
                />
                <button onClick={handleSearch}>Шукати</button>
              </div>

              {results.map((movie) => {
                const isAdded = addedIds.includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    onClick={() => handleOpenDetails(movie.id)}
                    style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', cursor: 'pointer' }}
                  >
                    {movie.poster_path && (
                      <img
                        src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                        alt={movie.title}
                        style={{ width: '60px', borderRadius: '4px' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <strong>{movie.title}</strong>
                      <p style={{ margin: 0, opacity: 0.7 }}>{movie.release_date}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddMovie(movie);
                      }}
                      disabled={isAdded}
                    >
                      {isAdded ? '✅ Додано' : '➕ Додати'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'mylist' && (
            <div>
              {myMovies.length === 0 && <p>Список поки порожній</p>}

              {myMovies.map((movie) => (
                <div
                  key={movie.id}
                  style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}
                >
                  {movie.poster_path && (
                    <img
                      src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      style={{ width: '60px', borderRadius: '4px' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <strong>{movie.title}</strong>
                    <p style={{ margin: 0, opacity: 0.7 }}>{movie.status}</p>
                  </div>
                  <button onClick={() => handleDeleteMovie(movie.id)}>🗑️ Видалити</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;