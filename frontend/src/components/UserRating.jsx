import { useState } from "react";

function UserRating({ rating, onSave }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="user-review-section">
      <div className="info-row">
        <span className="info-label">Моя оцінка</span>
        <button className="user-rating-badge" onClick={() => setOpen((v) => !v)}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px', color: '#ffc107' }}
          >
            star
          </span>
          <span>{rating ? `${rating} / 10` : 'Оцінити'}</span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px', color: 'var(--text-muted)' }}
          >
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      </div>

      {open && (
        <div className="stars-responsive-bar">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              className={`star-chip ${rating >= star ? 'filled' : ''}`}
              onClick={() => {
                onSave(star);
                setOpen(false);
              }}
            >
              <span className="material-symbols-outlined star-icon">star</span>
              <span className="star-num">{star}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserRating;