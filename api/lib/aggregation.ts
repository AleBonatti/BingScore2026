/**
 * Aggregation Logic Wrapper for Vercel
 * Uses relative imports instead of path aliases
 */

import type { MediaType, AggregatedRatings, UnifiedMediaId } from '../../lib/types/domain';
import type { TmdbProvider } from '../providers/tmdb';
import type { OmdbProvider } from '../providers/omdb';
import type { TraktProvider } from '../providers/trakt';
import { mergeEpisodeRatings } from '../../lib/domain/episode-merge';

export interface AggregationDependencies {
  tmdbProvider: TmdbProvider;
  omdbProvider: OmdbProvider;
  traktProvider: TraktProvider;
}

export async function aggregateRatings(
  tmdbId: number,
  mediaType: MediaType,
  deps: AggregationDependencies
): Promise<AggregatedRatings> {
  const { tmdbProvider, omdbProvider, traktProvider } = deps;

  // Step 1: Fetch TMDB details and external IDs
  const [details, externalIds] = await Promise.all([
    tmdbProvider.getMediaDetails(tmdbId, mediaType),
    tmdbProvider.getExternalIds(tmdbId, mediaType),
  ]);

  // Build UnifiedMediaId
  const ids: UnifiedMediaId = {
    mediaType,
    tmdbId,
    imdbId: externalIds.imdb_id || undefined,
  };

  // Step 2: Fetch ratings from all providers in parallel
  const [tmdbResult, omdbResult, traktResult] = await Promise.allSettled([
    tmdbProvider.getOverallRating(tmdbId, mediaType),
    externalIds.imdb_id ? omdbProvider.getOverallRatingByImdbId(externalIds.imdb_id) : null,
    (async () => {
      const traktId = await traktProvider.resolveTraktId(tmdbId, mediaType);
      if (!traktId) return null;
      ids.traktId = traktId;
      return traktProvider.getOverallRating(traktId, mediaType);
    })(),
  ]);

  // Step 3: Extract ratings
  const overall = {
    tmdb: tmdbResult.status === 'fulfilled' ? tmdbResult.value : null,
    imdb: omdbResult.status === 'fulfilled' ? omdbResult.value : null,
    trakt: traktResult.status === 'fulfilled' ? traktResult.value : null,
  };

  // Step 4: Fetch episode ratings for TV series
  let episodesBySeason;
  if (mediaType === 'tv' && ids.traktId) {
    const [tmdbEpisodesResult, traktEpisodesResult] = await Promise.allSettled([
      tmdbProvider.getEpisodeRatings(tmdbId),
      traktProvider.getEpisodeRatings(ids.traktId),
    ]);

    const tmdbEpisodes = tmdbEpisodesResult.status === 'fulfilled' ? tmdbEpisodesResult.value : [];
    const traktEpisodes =
      traktEpisodesResult.status === 'fulfilled' ? traktEpisodesResult.value : [];

    if (tmdbEpisodes.length > 0 || traktEpisodes.length > 0) {
      episodesBySeason = mergeEpisodeRatings(tmdbEpisodes, traktEpisodes);
    }
  }

  // Step 5: Build and return AggregatedRatings
  return {
    ids,
    title: details.title || details.name || 'Unknown',
    year: details.release_date
      ? new Date(details.release_date).getFullYear()
      : details.first_air_date
        ? new Date(details.first_air_date).getFullYear()
        : undefined,
    mediaType,
    overview: details.overview || undefined,
    posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
    overall,
    episodesBySeason,
  };
}
