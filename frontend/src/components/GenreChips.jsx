import { useRef } from "react";
import { GENRE_NAMES } from "../constants";
import { useDragScroll } from "../hooks/useDragScroll";

const CHIPS = Object.entries(GENRE_NAMES).filter(([id]) => id !== "10770");

function GenreChips({ onSelect }) {
  const ref = useRef(null);
  useDragScroll(ref);

  return (
    <div className="genre-chips" ref={ref}>
      {CHIPS.map(([id, name]) => (
        <button
          key={id}
          className="genre-chip"
          onClick={() => onSelect(name, { genre_id: id })}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

export default GenreChips;