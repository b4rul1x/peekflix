import RowNav from "./RowNav";
import { useRowScroll } from "../hooks/useRowScroll";
import { useDragScroll } from "../hooks/useDragScroll";

const IMG_URL = "https://image.tmdb.org/t/p/w500";

function pluralMovies(n) {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return "фільм";
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "фільми";
  return "фільмів";
}

function CollectionsRow({ collections, onOpen }) {
  const { ref, canLeft, canRight, update, scrollByPage } = useRowScroll([collections]);
  useDragScroll(ref, [collections.length > 0]);

  if (collections.length === 0) return null;

  return (
    <div className="home-row">
      <div className="row-header">
        <div className="row-title">Колекції та франшизи</div>
        <div className="row-actions">
          <RowNav
            canLeft={canLeft}
            canRight={canRight}
            onPrev={() => scrollByPage(-1)}
            onNext={() => scrollByPage(1)}
          />
        </div>
      </div>

      <div className="collections-track drag-scroll" ref={ref} onScroll={update}>
        {collections.map((c) => (
          <button
            key={c.id}
            className="collection-card"
            onClick={() => onOpen(c)}
          >
            <img
              className="collection-bg"
              src={`${IMG_URL}${c.backdrop_path || c.poster_path}`}
              alt=""
              loading="lazy"
            />
            <div className="collection-shade" />
            <div className="collection-info">
              <div className="collection-name">{c.name}</div>
              <div className="collection-count">
                {c.count} {pluralMovies(c.count)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CollectionsRow;