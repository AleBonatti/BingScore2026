/**
 * Domain Types for BingeScore Phase 1
 * Based on data-model.md specification
 */

export type MediaType = 'movie' | 'tv';

export interface SearchResult {
  provider: 'tmdb';
  tmdbId: number;
  imdbId?: string | null;
  mediaType: MediaType;
  title: string;
  originalTitle?: string;
  year?: number;
  overview?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
}

export interface UnifiedMediaId {
  mediaType: MediaType;
  tmdbId?: number;
  imdbId?: string;
  traktId?: string;
}

export interface OverallRating {
  source: 'tmdb' | 'imdb' | 'trakt';
  score: number | null;
  votes?: number | null;
}

export interface EpisodeRatingEntry {
  seasonNumber: number;
  episodeNumber: number;
  title?: string;
  tmdbScore?: number | null;
  traktScore?: number | null;
}

export interface AggregatedRatings {
  ids: UnifiedMediaId;
  title: string;
  year?: number;
  mediaType: MediaType;
  overview?: string;
  posterUrl?: string | null;
  overall: {
    tmdb?: OverallRating | null;
    imdb?: OverallRating | null;
    trakt?: OverallRating | null;
  };
  episodesBySeason?: {
    [seasonNumber: number]: EpisodeRatingEntry[];
  };
}
