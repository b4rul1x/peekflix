import { useState } from "react";

function UserRating({ rating, onSave }) {
  return (
    <div className="rating-card">
      <div className="rating-card-top">
        <span className="rating-card-title">Моя оцінка</span>
        <span className={`rating-card-value ${rating ? "" : "empty"}`}>
          {rating ? `${rating} / 10` : "Не оцінено"}
        </span>
      </div>

      <div className="rating-bar">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            key={value}
            className={`rating-segment ${rating >= value ? "filled" : ""}`}
            onClick={() => {
              if (value !== rating) onSave(value);
            }}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

export default UserRating;