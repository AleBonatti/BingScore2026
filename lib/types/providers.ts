/**
 * Provider-Specific Types for External APIs
 * Based on data-model.md specification
 */

// TMDB Types
export interface TmdbSearchResponse {
  results: Array<{
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title?: string;
    name?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
  }>;
}

export interface TmdbExternalIds {
  imdb_id?: string | null;
  tvdb_id?: number | null;
}

export interface TmdbEpisode {
  season_number: number;
  episode_number: number;
  name: string;
  vote_average: number | null;
}

export interface TmdbMediaDetails {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  number_of_seasons?: number;
}

export interface TmdbSeasonDetails {
  season_number: number;
  episodes: TmdbEpisode[];
}

export interface TmdbSearchResultItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

// OMDb Types
export interface OmdbResponse {
  Title: string;
  Year: string;
  imdbRating: string;
  imdbVotes: string;
  Response: 'True' | 'False';
  Error?: string;
}

// Trakt Types
export interface TraktSearchResult {
  type: 'movie' | 'show';
  score: number;
  movie?: { ids: { trakt: number; slug: string; imdb: string; tmdb: number } };
  show?: { ids: { trakt: number; slug: string; imdb: string; tmdb: number } };
}

export interface TraktRating {
  rating: number;
  votes: number;
  distribution: Record<string, number>;
}

export interface TraktEpisode {
  season: number;
  number: number;
  title: string;
  rating: number | null;
  votes: number | null;
}

export interface TraktSeasonWithEpisodes {
  number: number;
  episodes?: Array<{
    number: number;
    title?: string;
    rating?: number | null;
  }>;
}
