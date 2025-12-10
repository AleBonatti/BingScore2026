/**
 * TMDB Provider Wrapper for Vercel
 * Uses relative imports instead of path aliases
 *
 * NOTE: This is a duplicate of server/providers/tmdb.ts
 * Keep in sync when making changes! Only the imports differ.
 */

import type {
  SearchResult,
  MediaType,
  OverallRating,
  EpisodeRatingEntry,
} from '../../lib/types/domain.js';
import type {
  TmdbExternalIds,
  TmdbMediaDetails,
  TmdbSearchResultItem,
  TmdbSeasonDetails,
} from '../../lib/types/providers.js';
import { formatReleaseYear } from '../../lib/utils/format.js';

export interface TmdbProvider {
  searchMulti(query: string): Promise<SearchResult[]>;
  getMediaDetails(tmdbId: number, mediaType: MediaType): Promise<TmdbMediaDetails>;
  getExternalIds(tmdbId: number, mediaType: MediaType): Promise<TmdbExternalIds>;
  getOverallRating(tmdbId: number, mediaType: MediaType): Promise<OverallRating>;
  getEpisodeRatings(tmdbId: number): Promise<EpisodeRatingEntry[]>;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export function createTmdbProvider(apiKey: string): TmdbProvider {
  const searchMulti = async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { results?: TmdbSearchResultItem[] };
      const results = data.results || [];

      return results
        .filter((item): item is TmdbSearchResultItem & { media_type: 'movie' | 'tv' } =>
          item.media_type === 'movie' || item.media_type === 'tv'
        )
        .map((item) => ({
          provider: 'tmdb' as const,
          tmdbId: item.id,
          imdbId: null,
          mediaType: item.media_type,
          title: item.title || item.name || 'Unknown',
          originalTitle: item.original_title || item.original_name || undefined,
          year: item.release_date
            ? parseInt(formatReleaseYear(item.release_date), 10)
            : item.first_air_date
              ? parseInt(formatReleaseYear(item.first_air_date), 10)
              : undefined,
          overview: item.overview || undefined,
          posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
          backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}${item.backdrop_path}` : null,
        }));
    } catch (error) {
      console.error('TMDB searchMulti error:', error);
      throw error;
    }
  };

  const getMediaDetails = async (tmdbId: number, mediaType: MediaType): Promise<TmdbMediaDetails> => {
    try {
      const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
      const response = await fetch(`${TMDB_BASE_URL}/${endpoint}/${tmdbId}?api_key=${apiKey}`);

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      return (await response.json()) as TmdbMediaDetails;
    } catch (error) {
      console.error('TMDB getMediaDetails error:', error);
      throw error;
    }
  };

  const getExternalIds = async (tmdbId: number, mediaType: MediaType): Promise<TmdbExternalIds> => {
    try {
      const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `${TMDB_BASE_URL}/${endpoint}/${tmdbId}/external_ids?api_key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      return (await response.json()) as TmdbExternalIds;
    } catch (error) {
      console.error('TMDB getExternalIds error:', error);
      throw error;
    }
  };

  const getOverallRating = async (tmdbId: number, mediaType: MediaType): Promise<OverallRating> => {
    try {
      const details = await getMediaDetails(tmdbId, mediaType);
      return {
        source: 'tmdb',
        score: details.vote_average || null,
        votes: details.vote_count || null,
      };
    } catch (error) {
      console.error('TMDB getOverallRating error:', error);
      return { source: 'tmdb', score: null, votes: null };
    }
  };

  const getEpisodeRatings = async (tmdbId: number): Promise<EpisodeRatingEntry[]> => {
    try {
      const details = await getMediaDetails(tmdbId, 'tv');
      const numberOfSeasons = details.number_of_seasons || 0;

      if (numberOfSeasons === 0) {
        return [];
      }

      const seasonPromises: Promise<TmdbSeasonDetails | null>[] = [];
      for (let seasonNum = 1; seasonNum <= numberOfSeasons; seasonNum++) {
        seasonPromises.push(
          fetch(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNum}?api_key=${apiKey}`)
            .then((res) => (res.ok ? res.json() as Promise<TmdbSeasonDetails> : null))
            .catch(() => null)
        );
      }

      const seasons = await Promise.all(seasonPromises);

      const episodes: EpisodeRatingEntry[] = [];
      seasons.forEach((season) => {
        if (!season || !season.episodes) return;

        season.episodes.forEach((episode) => {
          episodes.push({
            seasonNumber: episode.season_number,
            episodeNumber: episode.episode_number,
            title: episode.name || undefined,
            tmdbScore: episode.vote_average || null,
          });
        });
      });

      return episodes;
    } catch (error) {
      console.error('TMDB getEpisodeRatings error:', error);
      return [];
    }
  };

  return { searchMulti, getMediaDetails, getExternalIds, getOverallRating, getEpisodeRatings };
}
