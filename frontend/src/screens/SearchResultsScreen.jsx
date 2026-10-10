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
    <div>
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Назад
        </button>
      </div>

      {results.length > 0 ? (
        results.map((movie) => (
          <SearchResultCard
            key={movie.id}
            movie={movie}
            isAdded={addedIds.includes(movie.id)}
            isMenuOpen={openSearchMenuId === movie.id}
            onOpen={() => onOpenMovie(movie)}
            onToggleMenu={() => onToggleMenu(movie.id)}
            onAdd={(status) => onAdd(movie, status)}
          />
        ))
      ) : (
        <div className="placeholder-text">Нічого не знайдено</div>
      )}
    </div>
  );
}

export default SearchResultsScreen;