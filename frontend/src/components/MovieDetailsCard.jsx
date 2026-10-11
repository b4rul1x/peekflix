import { getCountryName } from "../utils";

function MovieDetailsCard({ movie, onOpenFilter, onOpenPerson }) {
  const hasCountries = movie.countries?.length > 0;
  const hasCast = movie.cast?.length > 0;

  if (!hasCountries && !movie.director && !hasCast) return null;

  return (
    <div className="details-card">
      {hasCountries && (
        <div className="details-row">
          <div className="details-label">Країна</div>
          <div className="details-chips">
            {movie.countries.map((country) => {
              const countryName = getCountryName(country.code, country.name);
              return (
                <button
                  key={country.code}
                  className="chip chip-clickable"
                  onClick={() => onOpenFilter(`Країна: ${countryName}`, { country: country.code })}
                >
                  {countryName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {movie.director && (
        <div className="details-row">
          <div className="details-label">Режисер</div>
          <div className="details-chips">
            <button
              className="chip chip-clickable"
              onClick={() => onOpenPerson(movie.director.id)}
            >
              {movie.director.name}
            </button>
          </div>
        </div>
      )}

      {hasCast && (
        <div className="details-row">
          <div className="details-label">У головних ролях</div>
          <div className="details-chips">
            {movie.cast.map((actor) => (
              <button
                key={actor.id}
                className="chip chip-clickable"
                onClick={() => onOpenPerson(actor.id)}
              >
                {actor.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetailsCard;