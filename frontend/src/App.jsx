import { useEffect, useState } from "react";

const API_URL = 'http://127.0.0.1:8000';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w200';

function App() {
  const [username, setUsername] = useState('гість');
  const [userId, setUserId] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();

    if (tg.initDataUnsafe?.user) {
      setUsername(tg.initDataUnsafe.user.first_name);
      setUserId(tg.initDataUnsafe.user.id);
    }
  }, []);

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

  if (!response.ok) {
    console.error('Не вдалось додати фільм:', response.status);
    return;
  }
  
  setAddedIds((prev) => [...prev, movie.id]);
};

  return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎬 Peekflix</h1>
      <p>Привіт, {username}!</p>

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

      <div>
        {results.map((movie) => {
          const isAdded = addedIds.includes(movie.id);

          return (
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
                <p style={{ margin: 0, opacity: 0.7 }}>{movie.release_date}</p>
              </div>
              <button onClick={() => handleAddMovie(movie)} disabled={isAdded}>
                {isAdded ? 'Додано' : 'Додати'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;