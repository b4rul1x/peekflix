import HomeRow from "../components/HomeRow";
import { GENRE } from "../constants";

function HomeScreen({
  continueWatching,
  trending,
  topRated,
  nowPlaying,
  genreMovies,
  recommendations,
  similarMovies,
  similarSourceTitle,
  onOpenDetails,
  onSeeAll,
  getStatusIcon,
}) {
  return (
    <>
      {continueWatching.length > 0 && (
        <HomeRow
          title="Продовжити перегляд"
          movies={continueWatching}
          onMovieClick={(movie) => onOpenDetails(movie.tmdb_id, movie)}
          onSeeAll={() => onSeeAll('continueWatching')}
          getStatusIcon={getStatusIcon}
        />
      )}

      <HomeRow
        title="Зараз популярне"
        movies={trending}
        onMovieClick={(movie) => onOpenDetails(movie.id)}
        onSeeAll={() => onSeeAll('trending')}
        getStatusIcon={getStatusIcon}
      />

      <HomeRow
        title="Топ за рейтингом"
        movies={topRated}
        onMovieClick={(movie) => onOpenDetails(movie.id)}
        onSeeAll={() => onSeeAll('topRated')}
        getStatusIcon={getStatusIcon}
      />

      <HomeRow
        title="Новинки"
        movies={nowPlaying}
        onMovieClick={(movie) => onOpenDetails(movie.id)}
        onSeeAll={() => onSeeAll('nowPlaying')}
        getStatusIcon={getStatusIcon}
      />

      <HomeRow
        title={GENRE.title}
        movies={genreMovies}
        onMovieClick={(movie) => onOpenDetails(movie.id)}
        onSeeAll={() => onSeeAll('genre')}
        getStatusIcon={getStatusIcon}
      />

      {recommendations.length > 0 && (
        <HomeRow
          title="Рекомендації для вас"
          movies={recommendations}
          onMovieClick={(movie) => onOpenDetails(movie.id)}
          onSeeAll={() => onSeeAll('recommendations')}
          getStatusIcon={getStatusIcon}
        />
      )}

      {similarMovies.length > 0 && (
        <HomeRow
          title={`Схоже на ${similarSourceTitle}`}
          movies={similarMovies}
          onMovieClick={(movie) => onOpenDetails(movie.id)}
          onSeeAll={() => onSeeAll('similar')}
          getStatusIcon={getStatusIcon}
        />
      )}
    </>
  );
}

export default HomeScreen;