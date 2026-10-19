import HomeRow from "../components/HomeRow";
import HeroCarousel from "../components/HeroCarousel";
import Top10Row from "../components/Top10Row";
import Reveal from "../components/Reveal";
import UpcomingRow from "../components/UpcomingRow";
import GenreChips from "../components/GenreChips";
import CollectionsRow from "../components/CollectionsRow";
import { getReleaseLabel } from "../utils/releaseLabel";
import { GENRE } from "../constants";

function HomeScreen({
  continueWatching,
  trending,
  topRated,
  nowPlaying,
  upcoming,
  genreMovies,
  genreId,
  genreTitle,
  collections,
  onOpenFilter,
  onOpenCollection,
  recommendations,
  similarMovies,
  similarSourceTitle,
  onOpenDetails,
  onSeeAll,
  getStatusIcon,
}) {
  return (
    <>
      <GenreChips onSelect={onOpenFilter} />

      {trending.length > 0 && (
        <HeroCarousel
          movies={trending.slice(0, 5)}
          onOpenDetails={onOpenDetails}
        />
      )}
      {continueWatching.length > 0 && (
        <HomeRow
          title="Продовжити перегляд"
          movies={continueWatching}
          onMovieClick={(movie) => onOpenDetails(movie.tmdb_id, movie)}
          onSeeAll={() => onSeeAll('continueWatching')}
          getStatusIcon={getStatusIcon}
        />
      )}

      <Reveal>
        <Top10Row
          movies={trending}
          onMovieClick={(movie) => onOpenDetails(movie.id)}
          onSeeAll={() => onSeeAll('trending')}
        />
      </Reveal>

      <Reveal>
        <HomeRow
          title="Топ за рейтингом"
          movies={topRated}
          onMovieClick={(movie) => onOpenDetails(movie.id)}
          onSeeAll={() => onSeeAll('topRated')}
          getStatusIcon={getStatusIcon}
        />
      </Reveal>

      <Reveal>
        <HomeRow
          title="Новинки"
          movies={nowPlaying}
          onMovieClick={(movie) => onOpenDetails(movie.id)}
          onSeeAll={() => onSeeAll('nowPlaying')}
          getStatusIcon={getStatusIcon}
        />
      </Reveal>

      {upcoming.length > 0 && (
        <Reveal>
          <UpcomingRow
            movies={upcoming}
            onMovieClick={(movie) => onOpenDetails(movie.id)}
          />
        </Reveal>
      )}

      <Reveal>
        <HomeRow
          title={genreTitle}
          movies={genreMovies}
          onMovieClick={(movie) => onOpenDetails(movie.id)}
          onSeeAll={() => onOpenFilter(genreTitle, { genre_id: genreId })}
          getStatusIcon={getStatusIcon}
        />
      </Reveal>

      <Reveal>
        <CollectionsRow collections={collections} onOpen={onOpenCollection} />
      </Reveal>

      {recommendations.length > 0 && (
        <Reveal>
          <HomeRow
            title="Рекомендації для вас"
            movies={recommendations}
            onMovieClick={(movie) => onOpenDetails(movie.id)}
            onSeeAll={() => onSeeAll('recommendations')}
            getStatusIcon={getStatusIcon}
          />
        </Reveal>
      )}

      {similarMovies.length > 0 && (
        <Reveal>
          <HomeRow
            title={`Схоже на ${similarSourceTitle}`}
            movies={similarMovies}
            onMovieClick={(movie) => onOpenDetails(movie.id)}
            onSeeAll={() => onSeeAll('similar')}
            getStatusIcon={getStatusIcon}
          />
        </Reveal>
      )}
    </>
  );
}

export default HomeScreen;