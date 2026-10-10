function TrailerModal({ trailerKey, onClose }) {
  return (
    <div className="trailer-modal-overlay" onClick={onClose}>
      <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="trailer-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <iframe
          className="trailer-iframe"
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          title="Трейлер"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export default TrailerModal;