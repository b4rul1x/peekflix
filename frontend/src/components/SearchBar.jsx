import SearchResultCard from "./SearchResultCard";

function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  onFocus,
  showDropdown,
  results,
  isSearching,
  addedIds,
  openSearchMenuId,
  onOpenMovie,
  onToggleMenu,
  onAdd,
}) {

  const showResults = showDropdown && results.length > 0;
  const showEmpty =
    showDropdown && !isSearching && results.length === 0 && query.trim() !== "";
    
  return (
    <div className="search-bar" onClick={(e) => e.stopPropagation()}>
      <button className="search-icon-button" onClick={onSubmit}>
        <span className="material-symbols-outlined">search</span>
      </button>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        onFocus={onFocus}
        placeholder="Назва фільму..."
        className="search-input"
      />

      {(showResults || showEmpty) && (
        <div className="search-dropdown">
          {showResults ? (
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
            <div className="search-empty">Нічого не знайдено</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;