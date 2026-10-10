import { useEffect, useState, useRef } from "react";
import {
  API_URL,
  STATUSES,
  GENRE,
  CATEGORY_ENDPOINTS,
} from "./constants";
import PosterCard from "./components/PosterCard";
import ProfileScreen from "./screens/ProfileScreen";
import MyListScreen from "./screens/MyListScreen";
import SearchBar from "./components/SearchBar";
import HomeScreen from "./screens/HomeScreen";
import ExpandedScreen from "./screens/ExpandedScreen";
import SearchResultsScreen from "./screens/SearchResultsScreen";
import PersonScreen from "./screens/PersonScreen";
import MovieDetailScreen from "./screens/MovieDetailScreen";
import { fetchJson, jsonOptions } from "./api";

function App() {
  const [username, setUsername] = useState("гість");
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("search");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [openSearchMenuId, setOpenSearchMenuId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [myMovies, setMyMovies] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedMovies, setExpandedMovies] = useState([]);
  const [expandedPage, setExpandedPage] = useState(1);
  const [expandedHasMore, setExpandedHasMore] = useState(false);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [expandedScrollPosition, setExpandedScrollPosition] = useState(0);
  const previousMovieIdRef = useRef(null);

  const [genreMovies, setGenreMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [similarSourceTitle, setSimilarSourceTitle] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);

  const [filterStatus, setFilterStatus] = useState("watching");

  const [searchScreenOpen, setSearchScreenOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [recentMovies, setRecentMovies] = useState([]);
  const [movieHistory, setMovieHistory] = useState([]);
  const [customCategory, setCustomCategory] = useState(null);
  const [filterStack, setFilterStack] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personTab, setPersonTab] = useState("acted");
  const [personBioExpanded, setPersonBioExpanded] = useState(false);
  const [personVisibleCount, setPersonVisibleCount] = useState(20);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    try {
      tg.ready();
      tg.expand();
      if (typeof tg.disableVerticalSwipes === "function") {
        tg.disableVerticalSwipes();
      }
    } catch (err) {
      console.error("Telegram WebApp init error:", err);
    }

    if (tg.initDataUnsafe?.user) {
      setUsername(tg.initDataUnsafe.user.first_name);
      setUserId(tg.initDataUnsafe.user.id);
      setUserPhoto(tg.initDataUnsafe.user.photo_url || null);
    }
  }, []);

  useEffect(() => {
    loadTrending();
    loadTopRated();
    loadNowPlaying();
    loadGenreMovies();
  }, []);

  useEffect(() => {
    if (!userId) return;

    loadMyMovies();
    loadProfileStats();
    loadRecentMovies();
    loadContinueWatching();
    loadRecommendations();
    loadSimilar();
  }, [userId]);

  useEffect(() => {
    if (selectedMovie) {
      if (previousMovieIdRef.current !== selectedMovie.tmdb_id) {
        window.scrollTo(0, 0);
        previousMovieIdRef.current = selectedMovie.tmdb_id;
      }
    } else {
      previousMovieIdRef.current = null;
      if (expandedCategory && !selectedPerson) {
        window.scrollTo(0, expandedScrollPosition);
      }
    }
  }, [selectedMovie, expandedCategory]);

  useEffect(() => {
    if (selectedPerson) window.scrollTo(0, 0);
  }, [selectedPerson]);

  useEffect(() => {
    if (openSearchMenuId === null) return;
    const handleClickOutside = () => setOpenSearchMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openSearchMenuId]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const data = await fetchJson(
      `/search?query=${encodeURIComponent(query)}`,
      'Помилка запиту:'
    );
    if (data) setResults(data);
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
      setShowDropdown(true);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    handleSearch();
    setShowDropdown(false);
    setSearchScreenOpen(true);
  };

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  const handleAddMovie = async (movie, status = "watched") => {
    const response = await fetch(
      `${API_URL}/movies`,
      jsonOptions('POST', {
        tmdb_id: movie.tmdb_id ?? movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        user_id: userId,
        status,
      })
    );

    if (response.status === 409) {
      loadMyMovies();
      return;
    }

    if (!response.ok) {
      console.error("Не вдалось додати фільм:", response.status);
      return;
    }

    const savedMovie = await response.json();
    setMyMovies((prev) => [...prev, savedMovie]);
    setSelectedMovie((prev) =>
      prev && (prev.tmdb_id ?? prev.id) === savedMovie.tmdb_id
        ? { ...prev, id: savedMovie.id, status: savedMovie.status }
        : prev,
    );
    loadContinueWatching();
    loadProfileStats();
    loadRecentMovies();
  };

  const handleOpenDetails = async (tmdbId, myMovieRecord = null, options = {}) => {
    if (!options.keepHistory) {
      setMovieHistory([]);
    }

    const data = await fetchJson(`/movie/${tmdbId}`, 'Не вдалось завантажити деталі:');
    if (!data) return;

    const record = myMovieRecord ?? myMovies.find((m) => m.tmdb_id === tmdbId);

    if (record) {
      data.id = record.id;
      data.status = record.status;
      data.user_rating = record.user_rating;
    }
    setSelectedMovie(data);
  };

  const loadMyMovies = async () => {
    if (!userId) return;
    const data = await fetchJson(`/movies/${userId}`, 'Не вдалось завантажити список:');
    if (!data) return;
    setMyMovies(data);
  };

  const loadProfileStats = async () => {
    if (!userId) return;
    const data = await fetchJson(`/profile/stats/${userId}`, 'Не вдалось завантажити статистику:');
    if (data) setProfileStats(data);
  };

  const loadRecentMovies = async () => {
    if (!userId) return;
    const data = await fetchJson(`/profile/recent/${userId}`, 'Не вдалось завантажити останні фільми:');
    if (data) setRecentMovies(data);
  };

  const loadTrending = async () => {
    const data = await fetchJson('/home/trending', 'Не вдалось завантажити популярне:');
    if (data) setTrending(data.results);
  };

  const loadTopRated = async () => {
    const data = await fetchJson('/home/top-rated', 'Не вдалось завантажити топ за рейтингом:');
    if (data) setTopRated(data.results);
  };

  const loadNowPlaying = async () => {
    const data = await fetchJson('/home/now-playing', 'Не вдалось завантажити новинки:');
    if (data) setNowPlaying(data.results);
  };

  const loadContinueWatching = async () => {
    const data = await fetchJson(
      `/home/continue-watching/${userId}`,
      'Не вдалось завантажити "Продовжити перегляд":'
    );
    if (data) setContinueWatching(data);
  };

  const loadGenreMovies = async () => {
    const data = await fetchJson(
      `/home/by-genre?genre_id=${GENRE.id}`,
      'Не вдалось завантажити жанр:'
    );
    if (data) setGenreMovies(data.results);
  };

  const loadRecommendations = async () => {
    const data = await fetchJson(
      `/home/recommendations/${userId}`,
      'Не вдалось завантажити рекомендації:'
    );
    if (data) setRecommendations(data);
  };

  const loadSimilar = async () => {
    const data = await fetchJson(`/home/similar/${userId}`, 'Не вдалось завантажити "Схоже на":');
    if (!data) return;
    setSimilarSourceTitle(data.source_title);
    setSimilarMovies(data.results);
  };

  const loadExpandedPage = async (key, page, categoryOverride = null) => {
    const category =
      categoryOverride ?? (key === 'custom' ? customCategory : CATEGORY_ENDPOINTS[key]);
    setExpandedLoading(true);

    const separator = category.url.includes('?') ? '&' : '?';
    const data = await fetchJson(
      `${category.url}${separator}page=${page}`,
      'Не вдалось завантажити список:'
    );

    if (data) {
      setExpandedMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.tmdb_id ?? m.id));
        const newMovies = data.results.filter((m) => !existingIds.has(m.tmdb_id ?? m.id));
        return [...prev, ...newMovies];
      });
      setExpandedPage(page);
      setExpandedHasMore(page < data.total_pages);
    }
    setExpandedLoading(false);
  };

  const handleOpenExpanded = (key) => {
    setExpandedCategory(key);

    if (key === "continueWatching") {
      setExpandedMovies(continueWatching);
      setExpandedHasMore(false);
      return;
    }

    if (key === "recommendations") {
      setExpandedMovies(recommendations);
      setExpandedHasMore(false);
      return;
    }

    if (key === "similar") {
      setExpandedMovies(similarMovies);
      setExpandedHasMore(false);
      return;
    }

    setExpandedMovies([]);
    setExpandedHasMore(false);
    loadExpandedPage(key, 1);
  };

  const makeSnapshot = () => ({
    movie: selectedMovie,
    person: selectedPerson,
    category: expandedCategory,
    customCategory,
    movies: expandedMovies,
    page: expandedPage,
    hasMore: expandedHasMore,
    scroll: expandedScrollPosition,
    history: movieHistory,
  });

  const restoreSnapshot = (snapshot) => {
    setCustomCategory(snapshot.customCategory);
    setExpandedCategory(snapshot.category);
    setExpandedMovies(snapshot.movies);
    setExpandedPage(snapshot.page);
    setExpandedHasMore(snapshot.hasMore);
    setExpandedScrollPosition(snapshot.scroll);
    setMovieHistory(snapshot.history);
    setSelectedPerson(snapshot.person);
    setSelectedMovie(snapshot.movie);
  };

  const handleOpenFilter = (title, params) => {
    setFilterStack((prev) => [...prev, makeSnapshot()]);
    setSelectedPerson(null);
    const queryString = new URLSearchParams(params).toString();
    const category = { title, url: `/home/by-filter?${queryString}` };

    setCustomCategory(category);
    setExpandedScrollPosition(0);
    setSelectedMovie(null);
    setExpandedCategory("custom");
    setExpandedMovies([]);
    setExpandedHasMore(false);
    loadExpandedPage("custom", 1, category);
  };

  const getExpandedTitle = (key) => {
    if (key === "continueWatching") return "Продовжити перегляд";
    if (key === "recommendations") return "Рекомендації для вас";
    if (key === "similar") return `Схоже на ${similarSourceTitle}`;
    if (key === "custom") return customCategory?.title ?? "";
    return CATEGORY_ENDPOINTS[key].title;
  };

  const handleLoadMoreExpanded = () => {
    loadExpandedPage(expandedCategory, expandedPage + 1);
  };

  const handleCloseExpanded = () => {
    if (filterStack.length > 0) {
      const snapshot = filterStack[filterStack.length - 1];
      setFilterStack((prev) => prev.slice(0, -1));
      restoreSnapshot(snapshot);
      return;
    }
    setExpandedCategory(null);
  };

  const handleOpenPerson = async (personId) => {
    const data = await fetchJson(`/person/${personId}`, 'Не вдалось завантажити людину:');
    if (!data) return;

    setFilterStack((prev) => [...prev, makeSnapshot()]);
    setPersonTab(
      data.known_for_department === "Directing" && data.directed.length > 0
        ? "directed"
        : data.acted.length > 0
          ? "acted"
          : "directed",
    );
    setPersonBioExpanded(false);
    setPersonVisibleCount(20);
    setSelectedMovie(null);
    setSelectedPerson(data);
  };

  const handleClosePerson = () => {
    if (filterStack.length > 0) {
      const snapshot = filterStack[filterStack.length - 1];
      setFilterStack((prev) => prev.slice(0, -1));
      restoreSnapshot(snapshot);
      return;
    }
    setSelectedPerson(null);
  };

  const handleExpandedMovieClick = (movie) => {
    setExpandedScrollPosition(window.scrollY);

    if (expandedCategory === "continueWatching") {
      handleOpenDetails(movie.tmdb_id, movie);
    } else {
      handleOpenDetails(movie.id);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "mylist") {
      loadMyMovies();
    } else if (tab === "profile") {
      loadProfileStats();
      loadRecentMovies();
    }
  };

  const handleDeleteMovie = async (movieId) => {
    const result = await fetchJson(`/movies/${movieId}`, 'Не вдалось видалити фільм:', {
      method: 'DELETE',
    });
    if (!result) return;

    setMyMovies((prev) => prev.filter((movie) => movie.id !== movieId));
    loadProfileStats();
    loadRecentMovies();
  };

  const handleChangeStatus = async (movieId, newStatus) => {
    const result = await fetchJson(
      `/movies/${movieId}/status`,
      'Не вдалось змінити статус:',
      jsonOptions('PATCH', { status: newStatus })
    );
    if (!result) return;

    setSelectedMovie((prev) =>
      prev && prev.id === movieId ? { ...prev, status: newStatus } : prev
    );
    loadMyMovies();
    loadContinueWatching();
    loadProfileStats();
    loadRecentMovies();
  };

  const handleCollectionMovieClick = (movie) => {
    setMovieHistory((prev) => [...prev, selectedMovie]);
    handleOpenDetails(movie.tmdb_id, null, { keepHistory: true });
  };

  const handleCloseMovie = () => {
  if (movieHistory.length > 0) {
    const previous = movieHistory[movieHistory.length - 1];
    setMovieHistory((prev) => prev.slice(0, -1));
    setSelectedMovie(previous);
  } else {
    setSelectedMovie(null);
  }
};

  const handleSaveRating = async (movieId, newRating) => {
    const updatedMovie = await fetchJson(
      `/movies/${movieId}/details`,
      'Не вдалось оновити оцінку:',
      jsonOptions('PATCH', { user_rating: newRating })
    );
    if (!updatedMovie) return;

    setSelectedMovie((prev) => ({
      ...prev,
      user_rating: updatedMovie.user_rating,
    }));
    loadMyMovies();
  };

  const getMovieStatusIcon = (movie) => {
    const tmdbId = movie.tmdb_id ?? movie.id;
    const userMovie = myMovies.find((m) => m.tmdb_id === tmdbId);
    if (userMovie && STATUSES[userMovie.status]) {
      return STATUSES[userMovie.status];
    }
    return null;
  };

  const addedIds = myMovies.map((movie) => movie.tmdb_id);

  return (
    <div style={{ padding: "20px" }}>
      {selectedMovie ? (
        <MovieDetailScreen
          key={selectedMovie.tmdb_id}
          movie={selectedMovie}
          onBack={handleCloseMovie}
          onOpenFilter={handleOpenFilter}
          onOpenPerson={handleOpenPerson}
          onChangeStatus={handleChangeStatus}
          onAddMovie={handleAddMovie}
          onSaveRating={handleSaveRating}
          onMovieClick={handleCollectionMovieClick}
          getStatusIcon={getMovieStatusIcon}
        />
      ) : selectedPerson ? (
        <PersonScreen
          person={selectedPerson}
          tab={personTab}
          onTabChange={(tab) => {
            setPersonTab(tab);
            setPersonVisibleCount(20);
          }}
          bioExpanded={personBioExpanded}
          onToggleBio={() => setPersonBioExpanded((v) => !v)}
          visibleCount={personVisibleCount}
          onShowMore={() => setPersonVisibleCount((c) => c + 20)}
          onBack={handleClosePerson}
          onMovieClick={(movie) => handleOpenDetails(movie.tmdb_id)}
          getStatusIcon={getMovieStatusIcon}
        />
      ) : expandedCategory ? (
        <ExpandedScreen
          title={getExpandedTitle(expandedCategory)}
          movies={expandedMovies}
          hasMore={expandedHasMore}
          loading={expandedLoading}
          onBack={handleCloseExpanded}
          onMovieClick={handleExpandedMovieClick}
          onLoadMore={handleLoadMoreExpanded}
          getStatusIcon={getMovieStatusIcon}
        />
      ) : searchScreenOpen ? (
        <SearchResultsScreen
          results={results}
          addedIds={addedIds}
          openSearchMenuId={openSearchMenuId}
          onBack={() => setSearchScreenOpen(false)}
          onOpenMovie={(movie) => handleOpenDetails(movie.id)}
          onToggleMenu={(movieId) =>
            setOpenSearchMenuId((prev) => (prev === movieId ? null : movieId))
          }
          onAdd={(movie, status) => {
            handleAddMovie(movie, status);
            setOpenSearchMenuId(null);
          }}
        />
      ) : (
        <>
          <div className="app-header">Peekflix</div>

          {activeTab === 'search' && (
            <div>
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                onSubmit={handleSearchSubmit}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                showDropdown={showDropdown}
                results={results}
                addedIds={addedIds}
                openSearchMenuId={openSearchMenuId}
                onOpenMovie={(movie) => {
                  handleOpenDetails(movie.id);
                  setShowDropdown(false);
                }}
                onToggleMenu={(movieId) =>
                  setOpenSearchMenuId((prev) => (prev === movieId ? null : movieId))
                }
                onAdd={(movie, status) => {
                  handleAddMovie(movie, status);
                  setOpenSearchMenuId(null);
                  setShowDropdown(false);
                }}
              />

              <HomeScreen
                continueWatching={continueWatching}
                trending={trending}
                topRated={topRated}
                nowPlaying={nowPlaying}
                genreMovies={genreMovies}
                recommendations={recommendations}
                similarMovies={similarMovies}
                similarSourceTitle={similarSourceTitle}
                onOpenDetails={handleOpenDetails}
                onSeeAll={handleOpenExpanded}
                getStatusIcon={getMovieStatusIcon}
              />
            </div>
          )}

          {activeTab === 'mylist' && (
            <MyListScreen
              myMovies={myMovies}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              onOpenMovie={(movie) => handleOpenDetails(movie.tmdb_id, movie)}
              onChangeStatus={handleChangeStatus}
              onDelete={handleDeleteMovie}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileScreen
              username={username}
              userPhoto={userPhoto}
              profileStats={profileStats}
              recentMovies={recentMovies}
              onOpenMovie={(movie) => handleOpenDetails(movie.tmdb_id, movie)}
            />
          )}

          <div className="bottom-nav">
            <button
              className={`nav-item ${activeTab === "search" ? "active" : ""}`}
              onClick={() => handleTabChange("search")}
            >
              <span className="material-symbols-outlined">home</span>
              <span>Головна</span>
            </button>
            <button
              className={`nav-item ${activeTab === "mylist" ? "active" : ""}`}
              onClick={() => handleTabChange("mylist")}
            >
              <span className="material-symbols-outlined">bookmarks</span>
              <span>Мої фільми</span>
            </button>
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
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
