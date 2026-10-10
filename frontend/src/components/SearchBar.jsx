import SearchResultCard from "./SearchResultCard";

function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  onFocus,
  showDropdown,
  results,
  addedIds,
  openSearchMenuId,
  onOpenMovie,
  onToggleMenu,
  onAdd,
}) {
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

      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((movie) => (
            <SearchResultCard
              key={movie.id}
              movie={movie}
              isAdded={addedIds.includes(movie.id)}
              isMenuOpen={openSearchMenuId === movie.id}
              onOpen={() => onOpenMovie(movie)}
              onToggleMenu={() => onToggleMenu(movie.id)}
              onAdd={(status) => onAdd(movie, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;