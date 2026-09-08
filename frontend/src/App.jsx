import { useEffect, useState } from "react";

const API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:8000'
  : 'https://peekflix-production.up.railway.app';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w200';

const STATUSES = {
  watching: { label: 'Дивлюся', icon: 'visibility' },
  planned: { label: 'Заплановано', icon: 'bookmark' },
  watched: { label: 'Переглянуто', icon: 'check_circle' },
  dropped: { label: 'Покинуто', icon: 'cancel' },
  paused: { label: 'Відкладено', icon: 'pause_circle' },
  favorite: { label: 'Улюблене', icon: 'favorite' },
};

function App() {
  const [username, setUsername] = useState('гість');
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [addedIds, setAddedIds] = useState([]);

  const [myMovies, setMyMovies] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState(null)

  const [filterStatus, setFilterStatus] = useState('watching');

  const [showRatingPopover, setShowRatingPopover] = useState(false);

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

  const handleAddMovie = async (movie, status = 'watched') => {
    const response = await fetch(`${API_URL}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdb_id: movie.tmdb_id ?? movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        user_id: userId,
        status: 'watched',
      }),
  });

  if (response.status === 409) {
    setAddedIds((prev) => [...prev, movie.tmdb_id ?? movie.id]);
    return;
  }

  if (!response.ok) {
    console.error('Не вдалось додати фільм:', response.status);
    return;
  }
  
  const savedMovie = await response.json();
  setAddedIds((prev) => [...prev, savedMovie.tmdb_id]);
  setSelectedMovie((prev) => (prev ? { ...prev, id: savedMovie.id, status: savedMovie.status } : prev));
};

const handleOpenDetails = async (tmdbId, myMovieRecord = null) => {
  const response = await fetch(`${API_URL}/movie/${tmdbId}`);

  if (!response.ok) {
    console.error('Не вдалось завантажити деталі:', response.status);
    return;
  }

  const data = await response.json();

  if (myMovieRecord) {
    data.id = myMovieRecord.id;
    data.status = myMovieRecord.status;
    data.user_rating = myMovieRecord.user_rating;
  }
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

const handleChangeStatus = async(movieId, newStatus) => {
  const response = await fetch(`${API_URL}/movies/${movieId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    console.error('Не вдалось змінити статус:', response.status);
    return;
  }
  
  setSelectedMovie((prev) => ({ ...prev, status: newStatus }));
  }

const filteredMovies = myMovies.filter((movie) => movie.status === filterStatus);

const handleSaveRating = async (movieId, newRating) => {
  const response = await fetch(`${API_URL}/movies/${movieId}/details`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_rating: newRating }),
  });

  if (!response.ok) {
    console.error('Не вдалось оновити оцінку:', response.status);
    return;
  }

  const updatedMovie = await response.json();
  setSelectedMovie((prev) => ({
    ...prev,
    user_rating: updatedMovie.user_rating,
  }));
  loadMyMovies();
};

  return (
    <div style={{ padding: '20px' }}>
      {selectedMovie ? (
        <div>
          <button className="back-button" onClick={() => setSelectedMovie(null)}>
            <span className="material-symbols-outlined">arrow_back</span>
            Назад
          </button>

          <div className="movie-header">
            <div className="poster-column">
              {selectedMovie.poster_path && (
                <img
                  className="movie-poster"
                  src={`${TMDB_IMAGE_URL}${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                />
              )}
            </div>

            <div className="movie-info">
              <div className="title-row">
                <div className="movie-title">{selectedMovie.title}</div>
                <span className="rating-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>
                  {selectedMovie.vote_average?.toFixed(1)}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">Рік випуску</span>
                <div className="chip-group">
                  <span className="chip">{selectedMovie.release_date?.slice(0, 4)}</span>
                </div>
              </div>
              <div className="info-row">
                <span className="info-label">Країна</span>
                <div className="chip-group">
                  {selectedMovie.countries?.map((country) => (
                    <span key={country} className="chip">{country}</span>
                  ))}
                </div>
              </div>
              <div className="info-row">
                <span className="info-label">Жанр</span>
                <div className="chip-group">
                  {selectedMovie.genres?.map((genre) => (
                    <span key={genre} className="chip">{genre}</span>
                  ))}
                </div>
              </div>
              <div className="info-row">
                <span className="info-label">Тривалість</span>
                <div className="chip-group">
                  <span className="chip">{selectedMovie.runtime} хв</span>
                </div>
              </div>
              <div className="info-row">
                <span className="info-label">Режисер</span>
                <div className="chip-group">
                  <span className="chip">{selectedMovie.director}</span>
                </div>
              </div>
              <div className="info-row">
                <span className="info-label">У головних ролях</span>
                <div className="chip-group">
                  {selectedMovie.cast?.map((actor) => (
                    <span key={actor} className="chip">{actor}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="status-row">
            {Object.entries(STATUSES).map(([key, { label, icon }]) => (
              <button
                key={key}
                className={`status-button ${selectedMovie.status === key ? 'active' : ''}`}
                onClick={() =>
                  selectedMovie.status
                    ? handleChangeStatus(selectedMovie.id, key)
                    : handleAddMovie(selectedMovie, key)
                }
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="status-button-label">{label}</span>
              </button>
            ))}
          </div>

          {selectedMovie.id && (
            <div className="user-review-section">
              <div className="info-row">
                <span className="info-label">Моя оцінка</span>
                <button 
                  className="user-rating-badge"
                  onClick={() => setShowRatingPopover(!showRatingPopover)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ffc107' }}>star</span>
                  <span>{selectedMovie.user_rating ? `${selectedMovie.user_rating} / 10` : 'Оцінити'}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                    {showRatingPopover ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {showRatingPopover && (
                <div className="stars-responsive-bar">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      className={`star-chip ${selectedMovie.user_rating >= star ? 'filled' : ''}`}
                      onClick={() => {
                        handleSaveRating(selectedMovie.id, star);
                        setShowRatingPopover(false);
                      }}
                    >
                      <span className="material-symbols-outlined star-icon">star</span>
                      <span className="star-num">{star}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="overview-text-full">{selectedMovie.overview}</p>
        </div>
      ) : (
        <>
          <div className="app-header">Peekflix</div>

          {activeTab === 'search' && (
            <div>
              <div className="search-bar">
                <button className="search-icon-button" onClick={handleSearch}>
                  <span className="material-symbols-outlined">search</span>
                </button>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Назва фільму..."
                  className="search-input"
                />
              </div>

              {results.map((movie) => {
                const isAdded = addedIds.includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    className="list-card"
                    onClick={() => handleOpenDetails(movie.id)}
                  >
                    {movie.poster_path && (
                      <img
                        className="list-card-poster"
                        src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                        alt={movie.title}
                      />
                    )}
                    <div className="list-card-info">
                      <div className="list-card-title">{movie.title}</div>
                      <div className="list-card-meta">{movie.release_date?.slice(0, 4)}</div>
                    </div>
                    <button
                      className={`icon-button ${isAdded ? 'icon-button-active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddMovie(movie);
                      }}
                      disabled={isAdded}
                    >
                      <span className="material-symbols-outlined">
                        {isAdded ? 'check_circle' : 'add_circle'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'mylist' && (
            <div>
              <div className="status-filter-bar">
                {Object.entries(STATUSES).map(([key, { label, icon }]) => {
                  const isActive = filterStatus === key;
                  return (
                    <button
                      key={key}
                      className={`filter-chip ${isActive ? 'active' : ''}`}
                      onClick={() => setFilterStatus(key)}
                      title={label}
                    >
                      <span className="material-symbols-outlined">{icon}</span>
                      {isActive && <span className="chip-label">{label}</span>}
                    </button>
                  );
                })}
              </div>

              {filteredMovies.length === 0 ? (
                <p className="placeholder-text">Нічого не знайдено у цій категорії</p>
              ) : (
                filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="list-card"
                    onClick={() => handleOpenDetails(movie.tmdb_id, movie)}
                  >
                    {movie.poster_path && (
                      <img
                        className="list-card-poster"
                        src={`${TMDB_IMAGE_URL}${movie.poster_path}`}
                        alt={movie.title}
                      />
                    )}
                    <div className="list-card-info">
                      <div className="list-card-title">{movie.title}</div>
                      <div className="list-card-meta">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '14px', verticalAlign: 'middle' }}
                        >
                          {STATUSES[movie.status]?.icon}
                        </span>{' '}
                        {STATUSES[movie.status]?.label}
                      </div>
                    </div>
                    <button
                      className="icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMovie(movie.id);
                      }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="placeholder-text">Скоро тут буде профіль</div>
          )}

          <div className="bottom-nav">
            <button
              className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => handleTabChange('search')}
            >
              <span className="material-symbols-outlined">search</span>
              <span>Пошук</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'mylist' ? 'active' : ''}`}
              onClick={() => handleTabChange('mylist')}
            >
              <span className="material-symbols-outlined">bookmarks</span>
              <span>Мої фільми</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="material-symbols-outlined">person</span>
              <span>Профіль</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;