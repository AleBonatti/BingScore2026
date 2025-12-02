/**
 * TMDB Provider
 * API client for The Movie Database
 */

import type { SearchResult } from '@/lib/types/domain.js';
import { formatReleaseYear } from '@/lib/utils/format.js';

export interface TmdbProvider {
  searchMulti(query: string): Promise<SearchResult[]>;
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

      const data = await response.json();
      const results = data.results || [];

      // Filter and normalize results
      return results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => ({
          provider: 'tmdb' as const,
          tmdbId: item.id,
          imdbId: null,
          mediaType: item.media_type,
          title: item.title || item.name,
          originalTitle: item.original_title || item.original_name,
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

  return { searchMulti };
}
