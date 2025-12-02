# Data Model: BingeScore Phase 1 - Search & Ratings Aggregation

**Feature**: 001-search-ratings-aggregation
**Created**: 2025-12-02
**Purpose**: Define domain entities, data structures, and type definitions for Phase 1

## Overview

Phase 1 operates without database persistence. All data structures represent transient, in-memory entities used for API communication and business logic. This document extracts entities from the feature specification and defines their TypeScript types, validation rules, and relationships.

---

## 1. Core Domain Entities

### 1.1 MediaType

**Definition**: Union type representing supported media types

```typescript
export type MediaType = 'movie' | 'tv';
```

**Usage**: Discriminator for API queries and response handling

**Validation**: Must be exactly "movie" or "tv" (enforced by TypeScript + Zod)

---

### 1.2. SearchResult

**Definition**: Represents a single search result from TMDB

**Entity Specification** (from spec.md):

> "Search Result: Represents a single item returned from TMDB search, including TMDB ID, IMDb ID (if available), media type (movie/tv), title, year, overview, and image URLs"

**TypeScript Definition**:

```typescript
export interface SearchResult {
  provider: 'tmdb'; // Source identifier (always TMDB for Phase 1)
  tmdbId: number; // TMDB unique identifier
  imdbId?: string | null; // IMDb ID (format: "tt1234567"), if available
  mediaType: MediaType; // "movie" or "tv"
  title: string; // Display title (movie title or TV series name)
  originalTitle?: string; // Original title (if different from translated title)
  year?: number; // Release year (from release_date or first_air_date)
  overview?: string; // Synopsis/description
  posterUrl?: string | null; // Poster image URL (TMDB CDN path)
  backdropUrl?: string | null; // Backdrop image URL (TMDB CDN path)
}
```

**Validation Rules**:

- `tmdbId`: Required, positive integer
- `mediaType`: Required, must be "movie" or "tv"
- `title`: Required, non-empty string
- `year`: Optional, if present must be 1800-2100 (reasonable range)
- `posterUrl` / `backdropUrl`: Optional, if present must be valid URL path

**Zod Schema**:

```typescript
import { z } from 'zod';

export const SearchResultSchema = z.object({
  provider: z.literal('tmdb'),
  tmdbId: z.number().int().positive(),
  imdbId: z
    .string()
    .regex(/^tt\d+$/)
    .nullable()
    .optional(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().min(1),
  originalTitle: z.string().optional(),
  year: z.number().int().min(1800).max(2100).optional(),
  overview: z.string().optional(),
  posterUrl: z.string().nullable().optional(),
  backdropUrl: z.string().nullable().optional(),
});
```

**State Transitions**: None (immutable data structure)

**Relationships**:

- None (standalone entity)

---

### 1.3. UnifiedMediaId

**Definition**: Cross-platform identifier mapping for a media item

**Entity Specification** (from spec.md):

> "Unified Media Identifier: Represents a media item with IDs from multiple providers (TMDB ID, IMDb ID, Trakt ID) allowing cross-referencing across different rating platforms"

**TypeScript Definition**:

```typescript
export interface UnifiedMediaId {
  mediaType: MediaType; // "movie" or "tv"
  tmdbId?: number; // TMDB ID (always present from search)
  imdbId?: string; // IMDb ID (from TMDB external_ids, may be missing)
  traktId?: string; // Trakt ID (slug format: "breaking-bad")
}
```

**Validation Rules**:

- `mediaType`: Required
- At least one of `tmdbId`, `imdbId`, or `traktId` must be present
- `imdbId`: If present, must match format "tt\d+" (e.g., "tt0903747")
- `traktId`: If present, must be non-empty string (Trakt slug format)

**Zod Schema**:

```typescript
export const UnifiedMediaIdSchema = z
  .object({
    mediaType: z.enum(['movie', 'tv']),
    tmdbId: z.number().int().positive().optional(),
    imdbId: z
      .string()
      .regex(/^tt\d+$/)
      .optional(),
    traktId: z.string().min(1).optional(),
  })
  .refine((data) => data.tmdbId || data.imdbId || data.traktId, {
    message: 'At least one ID must be present',
  });
```

**Relationships**:

- Used as input to provider queries (resolve IDs across platforms)
- Included in `AggregatedRatings` response

---

### 1.4. OverallRating

**Definition**: Aggregated rating from a single source

**Entity Specification** (from spec.md):

> "Overall Rating: Represents aggregated rating information for the entire media item from a single source, including the rating score, number of votes, and source identifier"

**TypeScript Definition**:

```typescript
export interface OverallRating {
  source: 'tmdb' | 'imdb' | 'trakt'; // Rating provider
  score: number | null; // Rating score (normalized to 0-10 scale)
  votes?: number | null; // Number of votes/reviews
}
```

**Validation Rules**:

- `source`: Required, must be one of the three providers
- `score`: If present (not null), must be 0-10 (normalized scale)
- `votes`: If present, must be non-negative integer

**Score Normalization**:

- TMDB: 0-10 (native scale) → no conversion
- IMDb (OMDb): 0-10 (native scale) → no conversion
- Trakt: 0-10 (native scale) → no conversion

**Zod Schema**:

```typescript
export const OverallRatingSchema = z.object({
  source: z.enum(['tmdb', 'imdb', 'trakt']),
  score: z.number().min(0).max(10).nullable(),
  votes: z.number().int().nonnegative().nullable().optional(),
});
```

**State Transitions**: None (immutable)

**Relationships**:

- Multiple instances collected in `AggregatedRatings.overall`

---

### 1.5. EpisodeRatingEntry

**Definition**: Rating information for a single TV episode

**Entity Specification** (from spec.md):

> "Episode Rating: Represents rating information for a specific episode, including season number, episode number, episode title, and scores from TMDB and Trakt"

**TypeScript Definition**:

```typescript
export interface EpisodeRatingEntry {
  seasonNumber: number; // Season number (0 for specials)
  episodeNumber: number; // Episode number within season
  title?: string; // Episode title (from TMDB or Trakt)
  tmdbScore?: number | null; // TMDB rating (0-10), null if unavailable
  traktScore?: number | null; // Trakt rating (0-10), null if unavailable
}
```

**Validation Rules**:

- `seasonNumber`: Required, non-negative integer (0 for specials)
- `episodeNumber`: Required, positive integer
- `title`: Optional string
- `tmdbScore`: If present, must be 0-10
- `traktScore`: If present, must be 0-10
- At least one of `tmdbScore` or `traktScore` should be present (but can both be null if no ratings available)

**Zod Schema**:

```typescript
export const EpisodeRatingEntrySchema = z.object({
  seasonNumber: z.number().int().nonnegative(),
  episodeNumber: z.number().int().positive(),
  title: z.string().optional(),
  tmdbScore: z.number().min(0).max(10).nullable().optional(),
  traktScore: z.number().min(0).max(10).nullable().optional(),
});
```

**State Transitions**: None (immutable)

**Relationships**:

- Grouped by `seasonNumber` in `AggregatedRatings.episodesBySeason`

---

### 1.6. AggregatedRatings

**Definition**: Complete rating information for a media item, aggregated from all sources

**Entity Specification** (from spec.md):

> "Aggregated Ratings Response: Represents the complete rating information for a media item, including the unified identifiers, basic metadata (title, year, overview, images), overall ratings from all sources, and episode-by-episode ratings organized by season (for TV series only)"

**TypeScript Definition**:

```typescript
export interface AggregatedRatings {
  ids: UnifiedMediaId; // Cross-platform identifiers
  title: string; // Media title
  year?: number; // Release year
  mediaType: MediaType; // "movie" or "tv"
  overview?: string; // Synopsis
  posterUrl?: string | null; // Poster image URL
  overall: {
    // Overall ratings from all sources
    tmdb?: OverallRating | null;
    imdb?: OverallRating | null;
    trakt?: OverallRating | null;
  };
  episodesBySeason?: {
    // TV series only: episode ratings by season
    [seasonNumber: number]: EpisodeRatingEntry[];
  };
}
```

**Validation Rules**:

- `ids`: Required, must be valid `UnifiedMediaId`
- `title`: Required, non-empty string
- `mediaType`: Required
- `overall`: At least one of `tmdb`, `imdb`, or `trakt` should be present (but can all be null if all providers fail)
- `episodesBySeason`: Only present for `mediaType === 'tv'`, must be object with integer keys

**Zod Schema**:

```typescript
export const AggregatedRatingsSchema = z.object({
  ids: UnifiedMediaIdSchema,
  title: z.string().min(1),
  year: z.number().int().min(1800).max(2100).optional(),
  mediaType: z.enum(['movie', 'tv']),
  overview: z.string().optional(),
  posterUrl: z.string().nullable().optional(),
  overall: z.object({
    tmdb: OverallRatingSchema.nullable().optional(),
    imdb: OverallRatingSchema.nullable().optional(),
    trakt: OverallRatingSchema.nullable().optional(),
  }),
  episodesBySeason: z
    .record(
      z.string(), // season number as string key (JSON serialization)
      z.array(EpisodeRatingEntrySchema)
    )
    .optional(),
});
```

**State Transitions**: None (immutable, returned as API response)

**Relationships**:

- Composes `UnifiedMediaId`, `OverallRating[]`, and `EpisodeRatingEntry[]`
- Top-level response entity for `/api/media/aggregate` endpoint

---

## 2. Provider-Specific Types

### 2.1. TMDB Types

**Purpose**: Internal types for TMDB API responses (not exposed in public API)

**TmdbSearchResponse**:

```typescript
export interface TmdbSearchResponse {
  results: Array<{
    id: number;
    media_type: 'movie' | 'tv' | 'person'; // Filter out 'person'
    title?: string; // Movie title
    name?: string; // TV series name
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string; // ISO date (movies)
    first_air_date?: string; // ISO date (TV)
  }>;
}
```

**TmdbExternalIds**:

```typescript
export interface TmdbExternalIds {
  imdb_id?: string | null;
  tvdb_id?: number | null;
  // Other IDs not used in Phase 1
}
```

**TmdbEpisode**:

```typescript
export interface TmdbEpisode {
  season_number: number;
  episode_number: number;
  name: string;
  vote_average: number | null;
}
```

**Normalization**: Mapped to `SearchResult`, `EpisodeRatingEntry` by provider layer

---

### 2.2. OMDb Types

**Purpose**: Internal types for OMDb API responses

**OmdbResponse**:

```typescript
export interface OmdbResponse {
  Title: string;
  Year: string;
  imdbRating: string; // String format: "9.5"
  imdbVotes: string; // String format: "2,000,000" (with commas)
  Response: 'True' | 'False';
  Error?: string; // Present if Response === 'False'
}
```

**Normalization**: Parse `imdbRating` to number, parse `imdbVotes` by removing commas

---

### 2.3. Trakt Types

**Purpose**: Internal types for Trakt API responses

**TraktSearchResult**:

```typescript
export interface TraktSearchResult {
  type: 'movie' | 'show';
  score: number;
  movie?: { ids: { trakt: number; slug: string; imdb: string; tmdb: number } };
  show?: { ids: { trakt: number; slug: string; imdb: string; tmdb: number } };
}
```

**TraktRating**:

```typescript
export interface TraktRating {
  rating: number; // 0-10 scale
  votes: number;
  distribution: Record<string, number>; // Not used in Phase 1
}
```

**TraktEpisode**:

```typescript
export interface TraktEpisode {
  season: number;
  number: number;
  title: string;
  rating: number | null;
  votes: number | null;
}
```

**Normalization**: Mapped to `OverallRating`, `EpisodeRatingEntry`

---

## 3. API Request/Response Types

### 3.1. GET /api/search

**Request Query Parameters**:

```typescript
export interface SearchQueryParams {
  q: string; // Search query (minimum 2 characters per FR-001a)
}
```

**Response**:

```typescript
export type SearchResponse = SearchResult[];
```

**Error Response**:

```typescript
export interface ErrorResponse {
  data: null;
  error: {
    message: string;
    code?: string; // Optional error code (e.g., "RATE_LIMIT_EXCEEDED")
  };
}
```

---

### 3.2. GET /api/media/aggregate

**Request Query Parameters**:

```typescript
export interface AggregateQueryParams {
  tmdbId: number; // TMDB ID from search result
  mediaType: MediaType; // "movie" or "tv"
}
```

**Response**:

```typescript
export type AggregateResponse = AggregatedRatings;
```

**Error Response**: Same as `ErrorResponse` above

---

## 4. Entity Relationships Diagram

```
┌──────────────────────────────────────────────┐
│          SearchResult                        │
│  - tmdbId, imdbId (optional)                 │
│  - title, year, overview                     │
│  - mediaType                                 │
└──────────────────────────────────────────────┘
                  │
                  │ User selects
                  ▼
┌──────────────────────────────────────────────┐
│      UnifiedMediaId                          │
│  - tmdbId, imdbId, traktId                   │
│  - mediaType                                 │
└──────────────────────────────────────────────┘
                  │
                  │ Used to fetch
                  ▼
┌──────────────────────────────────────────────┐
│      AggregatedRatings                       │
│  - ids: UnifiedMediaId                       │
│  - title, year, mediaType                    │
│  - overall: {tmdb, imdb, trakt}              │
│  - episodesBySeason (TV only)                │
└──────────────────────────────────────────────┘
                  │
                  ├──► Overall Ratings
                  │    - OverallRating × 3 (tmdb, imdb, trakt)
                  │
                  └──► Episode Ratings (TV only)
                       - EpisodeRatingEntry[] grouped by season
```

---

## 5. Data Flow

### 5.1. Search Flow

```
User Input (query)
  │
  ▼
Frontend (SearchBar)
  │ Debounce 300ms (FR-001a)
  ▼
GET /api/search?q={query}
  │
  ▼
TmdbProvider.searchMulti(query)
  │ Fetch from TMDB API
  ▼
Raw TMDB Response
  │ Zod validation + normalization
  ▼
SearchResult[]
  │ Filter mediaType === 'movie' | 'tv'
  ▼
Return to Frontend
```

### 5.2. Aggregation Flow

```
User selects SearchResult
  │
  ▼
Frontend extracts tmdbId + mediaType
  │
  ▼
GET /api/media/aggregate?tmdbId={id}&mediaType={type}
  │
  ▼
Build UnifiedMediaId
  │ Fetch TMDB details + external IDs
  ▼
UnifiedMediaId { tmdbId, imdbId }
  │
  ├──► Parallel fetching (Promise.allSettled)
  │
  ├──► TmdbProvider.getOverallRating(tmdbId)
  │
  ├──► OmdbProvider.getOverallRating(imdbId)
  │    (if imdbId available)
  │
  └──► TraktProvider.resolveTraktId(tmdbId)
       │ Then fetch ratings
       ▼
       TraktProvider.getOverallRating(traktId)
  │
  ▼
Merge all ratings + episodes
  │
  ▼
AggregatedRatings
  │
  ▼
Return to Frontend
```

---

## 6. Validation Summary

| Entity             | Required Fields                | Optional Fields                                | Validation Constraints                           |
| ------------------ | ------------------------------ | ---------------------------------------------- | ------------------------------------------------ |
| SearchResult       | tmdbId, mediaType, title       | imdbId, year, overview, posterUrl, backdropUrl | tmdbId > 0, mediaType in ['movie', 'tv']         |
| UnifiedMediaId     | mediaType                      | tmdbId, imdbId, traktId                        | At least one ID present                          |
| OverallRating      | source                         | score, votes                                   | score 0-10, votes ≥ 0                            |
| EpisodeRatingEntry | seasonNumber, episodeNumber    | title, tmdbScore, traktScore                   | seasonNumber ≥ 0, episodeNumber > 0, scores 0-10 |
| AggregatedRatings  | ids, title, mediaType, overall | year, overview, posterUrl, episodesBySeason    | At least one overall rating source attempted     |

---

## 7. Immutability & State Management

**Design Principle**: All domain entities are immutable (read-only after creation)

**Rationale**:

- Phase 1 is stateless - no persistence, no caching
- Data flows unidirectionally: API → provider → domain logic → frontend
- Immutability simplifies reasoning about data transformations
- TypeScript `readonly` modifiers enforce immutability at compile time

**Example** (with readonly):

```typescript
export interface SearchResult {
  readonly provider: 'tmdb';
  readonly tmdbId: number;
  readonly mediaType: MediaType;
  readonly title: string;
  // ... other fields
}
```

**Note**: Phase 1 does not use `readonly` everywhere for simplicity, but all entities should be treated as immutable in practice.

---

## 8. Future Considerations (Post-Phase 1)

**Database Schema (when persistence is added)**:

- `shows` table: id, tmdb_id, imdb_id, trakt_id, title, year, media_type
- `episodes` table: id, show_id, season_number, episode_number, title
- `ratings` table: id, media_id, source, score, votes, updated_at

**Caching Strategy**:

- Cache `AggregatedRatings` responses in Redis for 1 hour (reduce external API calls)
- Cache TMDB search results for 5 minutes

**User Data**:

- `users` table: id, email, hashed_password
- `watchlist` table: user_id, media_id, added_at
- `favorites` table: user_id, media_id, added_at

**Data Not Relevant for Phase 1**: No persistence, so no database schema needed yet.

---

**Data Model Complete**: All entities, types, validation rules, and relationships documented. Ready to proceed to API contract generation.
