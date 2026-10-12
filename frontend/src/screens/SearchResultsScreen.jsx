import SearchResultCard from "../components/SearchResultCard";

function SearchResultsScreen({
  results,
  addedIds,
  openSearchMenuId,
  onBack,
  onOpenMovie,
  onToggleMenu,
  onAdd,
}) {
  return (
    <div className="results-screen">
      <div className="movie-topbar expanded-topbar">
        <button className="back-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Назад
        </button>
        <span className="movie-topbar-title">Результати</span>
        <span />
      </div>

      {results.length > 0 ? (
        results.map((movie) => (
          <SearchResultCard
            key={movie.id}
            detailed
            movie={movie}
            isAdded={addedIds.includes(movie.id)}
            isMenuOpen={openSearchMenuId === movie.id}
            onOpen={() => onOpenMovie(movie)}
            onToggleMenu={() => onToggleMenu(movie.id)}
            onAdd={(status) => onAdd(movie, status)}
          />
        ))
      ) : (
        <div className="search-empty results-empty">
          Нічого не знайдено
          <div className="results-empty-hint">Спробуйте іншу назву</div>
        </div>
      )}
    </div>
  );
}

export default SearchResultsScreen;