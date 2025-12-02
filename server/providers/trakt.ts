/**
 * Trakt Provider
 * API client for Trakt.tv ratings
 */

import type { MediaType, OverallRating, EpisodeRatingEntry } from '@/lib/types/domain.js';

export interface TraktProvider {
  resolveTraktId(tmdbId: number, mediaType: MediaType): Promise<string | null>;
  getOverallRating(traktId: string, mediaType: MediaType): Promise<OverallRating | null>;
  getEpisodeRatings(traktId: string): Promise<EpisodeRatingEntry[]>;
}

const TRAKT_BASE_URL = 'https://api.trakt.tv';

export function createTraktProvider(clientId: string): TraktProvider {
  const headers = {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': clientId,
  };

  const resolveTraktId = async (
    tmdbId: number,
    mediaType: MediaType
  ): Promise<string | null> => {
    try {
      const type = mediaType === 'movie' ? 'movie' : 'show';
      const response = await fetch(
        `${TRAKT_BASE_URL}/search/tmdb/${tmdbId}?type=${type}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Trakt API error: ${response.statusText}`);
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        return null;
      }

      const item = results[0];
      const ids = item.movie?.ids || item.show?.ids;

      return ids?.slug || ids?.trakt?.toString() || null;
    } catch (error) {
      console.error('Trakt resolveTraktId error:', error);
      return null;
    }
  };

  const getOverallRating = async (
    traktId: string,
    mediaType: MediaType
  ): Promise<OverallRating | null> => {
    try {
      const endpoint = mediaType === 'movie' ? 'movies' : 'shows';
      const response = await fetch(`${TRAKT_BASE_URL}/${endpoint}/${traktId}/ratings`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Trakt API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || typeof data.rating !== 'number') {
        return null;
      }

      return {
        source: 'trakt',
        score: data.rating,
        votes: data.votes || null,
      };
    } catch (error) {
      console.error('Trakt getOverallRating error:', error);
      return null;
    }
  };

  const getEpisodeRatings = async (traktId: string): Promise<EpisodeRatingEntry[]> => {
    try {
      const response = await fetch(`${TRAKT_BASE_URL}/shows/${traktId}/seasons?extended=episodes`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Trakt API error: ${response.statusText}`);
      }

      const seasons = await response.json();

      if (!seasons || !Array.isArray(seasons)) {
        return [];
      }

      const episodes: EpisodeRatingEntry[] = [];

      seasons.forEach((season: any) => {
        if (!season.episodes || !Array.isArray(season.episodes)) return;

        season.episodes.forEach((episode: any) => {
          episodes.push({
            seasonNumber: season.number,
            episodeNumber: episode.number,
            title: episode.title || undefined,
            traktScore: episode.rating || null,
          });
        });
      });

      return episodes;
    } catch (error) {
      console.error('Trakt getEpisodeRatings error:', error);
      return [];
    }
  };

  return { resolveTraktId, getOverallRating, getEpisodeRatings };
}
