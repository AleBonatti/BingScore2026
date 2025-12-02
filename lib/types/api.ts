/**
 * API Request/Response Types
 * Based on data-model.md specification
 */

import type { SearchResult, AggregatedRatings, MediaType } from './domain.js';

// Search Endpoint
export interface SearchQueryParams {
  q: string;
}

export type SearchResponse = SearchResult[];

// Aggregate Endpoint
export interface AggregateQueryParams {
  tmdbId: number;
  mediaType: MediaType;
}

export type AggregateResponse = AggregatedRatings;

// Error Response
export interface ErrorResponse {
  data: null;
  error: {
    message: string;
    code?: string;
  };
}
