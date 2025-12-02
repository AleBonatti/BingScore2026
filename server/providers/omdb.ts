/**
 * OMDb Provider
 * API client for Open Movie Database (IMDb ratings)
 */

import type { OverallRating } from '@/lib/types/domain.js';

export interface OmdbProvider {
  getOverallRatingByImdbId(imdbId: string): Promise<OverallRating | null>;
}

const OMDB_BASE_URL = 'http://www.omdbapi.com/';

export function createOmdbProvider(apiKey: string): OmdbProvider {
  const getOverallRatingByImdbId = async (imdbId: string): Promise<OverallRating | null> => {
    try {
      const response = await fetch(`${OMDB_BASE_URL}?i=${imdbId}&apikey=${apiKey}`);

      if (!response.ok) {
        throw new Error(`OMDb API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.Response === 'False') {
        console.warn(`OMDb error for ${imdbId}:`, data.Error);
        return null;
      }

      // Parse rating and votes
      const rating = parseFloat(data.imdbRating);
      const votes = parseInt(data.imdbVotes?.replace(/,/g, '') || '0', 10);

      if (isNaN(rating)) {
        return null;
      }

      return {
        source: 'imdb',
        score: rating,
        votes: isNaN(votes) ? null : votes,
      };
    } catch (error) {
      console.error('OMDb getOverallRatingByImdbId error:', error);
      return null;
    }
  };

  return { getOverallRatingByImdbId };
}
