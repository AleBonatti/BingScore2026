# Research: BingeScore Phase 1 - Search & Ratings Aggregation

**Feature**: 001-search-ratings-aggregation
**Created**: 2025-12-02
**Purpose**: Research API integration patterns, external provider best practices, and technical decisions for Phase 1 implementation

## Overview

This document consolidates research findings for integrating with TMDB, OMDb, and Trakt APIs, implementing provider abstraction patterns, and establishing best practices for stateless real-time aggregation.

---

## 1. External API Integration Patterns

### Decision: Provider Abstraction Layer

**What was chosen**: Implement a provider abstraction layer with separate modules for each external API (TMDB, OMDb, Trakt) under `server/providers/`

**Rationale**:
- Each API has different authentication mechanisms, rate limits, and response formats
- Provider modules encapsulate API-specific logic and normalize responses to internal domain types
- Enables independent testing with mocked providers
- Makes it easy to swap providers or add new ones without touching business logic

**Implementation Pattern**:
```typescript
// server/providers/tmdb.ts
export interface TmdbProvider {
  searchMulti(query: string): Promise<SearchResult[]>;
  getMediaDetails(tmdbId: number, mediaType: MediaType): Promise<MediaDetails>;
  getExternalIds(tmdbId: number, mediaType: MediaType): Promise<ExternalIds>;
  getEpisodeRatings(tmdbId: number): Promise<EpisodeRatingEntry[]>;
}

// Each provider exports a factory function
export function createTmdbProvider(apiKey: string): TmdbProvider {
  // Implementation with fetch + Zod validation
}
```

**Alternatives considered**:
- **Direct API calls in routes**: Rejected because it couples HTTP logic with external API specifics, making testing harder
- **Single unified provider class**: Rejected because APIs are too different (authentication, endpoints, response formats)
- **External library (e.g., tmdb-js)**: Rejected to maintain full control over request/response handling and TypeScript types

---

## 2. TMDB API Integration

### Authentication & Configuration

**Decision**: Use TMDB API v3 with Bearer Token authentication

**Details**:
- API Key stored in environment variable `TMDB_API_KEY`
- Base URL: `https://api.themoviedb.org/3`
- Rate Limit: 40 requests per 10 seconds (generous for Phase 1)
- Authentication: Include API key in query string OR use Authorization header

**Example Request**:
```
GET https://api.themoviedb.org/3/search/multi?query=breaking+bad&api_key={key}
```

### Key Endpoints for Phase 1

1. **Search Multi**: `/search/multi`
   - Returns combined results for movies and TV shows
   - Filter by `media_type` to get only "movie" or "tv"
   - Returns: ID, title, overview, poster_path, release_date/first_air_date

2. **Get Movie/TV Details**: `/movie/{id}` or `/tv/{id}`
   - Returns full metadata including vote_average, vote_count
   - Includes genres, runtime/episode_run_time

3. **Get External IDs**: `/movie/{id}/external_ids` or `/tv/{id}/external_ids`
   - Returns IMDb ID needed for OMDb lookup
   - Format: `imdb_id: "tt0903747"`

4. **Get TV Season Details**: `/tv/{id}/season/{season_number}`
   - Returns episode list with vote_average per episode
   - Used for episode-by-episode ratings

### Response Normalization

**Decision**: Use Zod schemas to validate and transform TMDB responses

**Rationale**:
- TMDB API can return inconsistent data (missing fields, nulls)
- Zod provides runtime validation + TypeScript type inference
- Fail fast on unexpected API changes

**Example Schema**:
```typescript
import { z } from 'zod';

const TmdbSearchResultSchema = z.object({
  id: z.number(),
  media_type: z.enum(['movie', 'tv']),
  title: z.string().optional(),
  name: z.string().optional(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
});

export const TmdbSearchResponseSchema = z.object({
  results: z.array(TmdbSearchResultSchema),
});
```

---

## 3. OMDb API Integration

### Authentication & Configuration

**Decision**: Use OMDb API with API Key parameter

**Details**:
- API Key stored in environment variable `OMDB_API_KEY`
- Base URL: `http://www.omdbapi.com/`
- Rate Limit: 1,000 requests per day (free tier) - sufficient for Phase 1
- Authentication: Include API key as query parameter `?apikey={key}`

### Key Endpoint for Phase 1

**Get by IMDb ID**: `/?i={imdb_id}&apikey={key}`
- Requires IMDb ID from TMDB external_ids
- Returns: IMDb rating (imdbRating), vote count (imdbVotes)

**Example Request**:
```
GET http://www.omdbapi.com/?i=tt0903747&apikey={key}
```

**Response Format**:
```json
{
  "Title": "Breaking Bad",
  "imdbRating": "9.5",
  "imdbVotes": "2,000,000",
  ...
}
```

### Error Handling

**Decision**: Graceful degradation when OMDb is unavailable

**Rationale**:
- OMDb might fail (rate limits, downtime, invalid IMDb ID)
- Specification requires displaying ratings from at least 2 out of 3 sources 90% of the time
- Return null for OMDb rating and continue with TMDB + Trakt

---

## 4. Trakt API Integration

### Authentication & Configuration

**Decision**: Use Trakt API v2 with Client ID authentication (no OAuth for Phase 1)

**Details**:
- Client ID stored in environment variable `TRAKT_CLIENT_ID`
- Base URL: `https://api.trakt.tv`
- Rate Limit: 1,000 requests per 5 minutes
- Authentication: Include Client ID in header `trakt-api-key: {client_id}`
- API version header: `trakt-api-version: 2`

### Key Endpoints for Phase 1

1. **Search by TMDB ID**: `/search/tmdb/{tmdb_id}?type=movie` or `type=show`
   - Resolves TMDB ID to Trakt ID
   - Returns Trakt slug needed for other endpoints

2. **Get Movie Ratings**: `/movies/{trakt_id}/ratings`
   - Returns aggregated rating (0-10 scale) and vote count

3. **Get Show Ratings**: `/shows/{trakt_id}/ratings`
   - Returns overall show rating

4. **Get Show Seasons**: `/shows/{trakt_id}/seasons?extended=episodes,full`
   - Returns all seasons with episode details including ratings
   - Each episode includes rating field (0-10 scale)

### Trakt ID Resolution Strategy

**Decision**: Implement two-step lookup (TMDB ID → Trakt ID → ratings)

**Rationale**:
- Trakt requires its own IDs for most endpoints
- Search endpoint can resolve external IDs (TMDB, IMDb) to Trakt IDs
- Cache Trakt ID resolution in-memory for the request lifecycle (no persistence in Phase 1)

---

## 5. Rating Aggregation Logic

### Decision: Parallel fetching with Promise.allSettled

**What was chosen**: Fetch ratings from all providers in parallel, handle partial failures

**Implementation Pattern**:
```typescript
export async function aggregateRatings(
  tmdbId: number,
  mediaType: MediaType
): Promise<AggregatedRatings> {
  const [tmdbResult, omdbResult, traktResult] = await Promise.allSettled([
    tmdbProvider.getRating(tmdbId, mediaType),
    omdbProvider.getRating(imdbId), // requires IMDb ID from TMDB first
    traktProvider.getRating(traktId, mediaType), // requires Trakt ID resolution first
  ]);

  // Map results, handle rejections gracefully
  const overall = {
    tmdb: tmdbResult.status === 'fulfilled' ? tmdbResult.value : null,
    imdb: omdbResult.status === 'fulfilled' ? omdbResult.value : null,
    trakt: traktResult.status === 'fulfilled' ? traktResult.value : null,
  };

  return { ids, title, mediaType, overall, episodesBySeason };
}
```

**Rationale**:
- Promise.allSettled doesn't fail if one provider fails
- Meets requirement SC-006: "at least 2 out of 3 sources for 90% of requests"
- Faster than sequential fetching

**Alternatives considered**:
- **Sequential fetching**: Rejected for performance (would add 5-10 seconds latency)
- **Promise.all**: Rejected because one failure would fail entire request
- **Retry logic**: Deferred to future phase (adds complexity, Phase 1 is stateless)

---

## 6. Episode Ratings Merge Strategy

### Decision: Merge TMDB and Trakt episode ratings by season/episode number

**What was chosen**: Create unified data structure with side-by-side TMDB and Trakt scores

**Implementation Pattern**:
```typescript
export function mergeEpisodeRatings(
  tmdbEpisodes: TmdbEpisode[],
  traktEpisodes: TraktEpisode[]
): Record<number, EpisodeRatingEntry[]> {
  // Group by season number
  // Match by episode number within season
  // Return: { [seasonNumber]: [{ seasonNumber, episodeNumber, title, tmdbScore, traktScore }] }
}
```

**Data Structure**:
```typescript
export interface EpisodeRatingEntry {
  seasonNumber: number;
  episodeNumber: number;
  title?: string; // from TMDB or Trakt
  tmdbScore?: number | null;
  traktScore?: number | null;
}
```

**Edge Cases Handled**:
- Missing episodes in one provider (display as null)
- Episode count mismatch between providers
- Special episodes (season 0) - included if present

**Alternatives considered**:
- **Average the scores**: Rejected because spec requires raw data display (FR-015)
- **Separate tables for each provider**: Rejected because harder to compare side-by-side

---

## 7. Error Handling & User Feedback

### Decision: Toast notifications for errors (react-hot-toast)

**What was chosen**: Use react-hot-toast for transient error messages

**Use Cases**:
- API rate limit exceeded (FR-016a): "Rate limit reached. Please try again in a moment."
- Provider unavailable: "Unable to fetch ratings from {provider}. Showing available data."
- No results: "No titles found matching your search."
- Network timeout: "Request timed out. Please check your connection."

**Rationale**:
- Non-intrusive (toast slides in from corner)
- Auto-dismisses after 3-5 seconds
- Consistent with UI specification requirement for "toast-style notifications"

**Configuration**:
```typescript
import toast from 'react-hot-toast';

// Error toast
toast.error('Rate limit exceeded. Please try again shortly.', {
  duration: 4000,
  position: 'top-right',
});

// Warning toast (partial data)
toast.warning('Some ratings unavailable. Showing available data.', {
  duration: 5000,
});
```

---

## 8. Data Fetching Strategy (Frontend)

### Decision: Use TanStack Query for server state management

**What was chosen**: TanStack Query (formerly React Query) for API calls

**Rationale**:
- Built-in loading/error states
- Automatic request deduplication
- Stale-while-revalidate caching (configurable)
- Perfect for stateless API integration

**Implementation Pattern**:
```typescript
// hooks/useSearch.ts
import { useQuery } from '@tanstack/react-query';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetch(`/api/search?q=${query}`).then(r => r.json()),
    enabled: query.length >= 2, // FR-001a: only search after 2+ characters
    staleTime: 5 * 60 * 1000, // 5 minutes (reasonable for search results)
  });
}
```

**Alternatives considered**:
- **Plain fetch with useState**: Rejected because need to handle loading/error/caching manually
- **SWR**: Considered, but TanStack Query has better TypeScript support and more features
- **RTK Query**: Rejected because don't need Redux for Phase 1

---

## 9. Debouncing Search Input

### Decision: Implement 300ms debounce with lodash.debounce or custom hook

**What was chosen**: Custom React hook with useEffect + setTimeout

**Implementation Pattern**:
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in SearchBar
const [inputValue, setInputValue] = useState('');
const debouncedQuery = useDebounce(inputValue, 300); // FR-001a: 300ms debounce
const { data, isLoading } = useSearch(debouncedQuery);
```

**Rationale**:
- Reduces API calls (user types fast, wait until they pause)
- Simple implementation, no external dependency
- 300ms is industry standard for search autocomplete

**Alternatives considered**:
- **lodash.debounce**: Considered, but adds dependency and useEffect approach is cleaner with React
- **No debounce**: Rejected because would hammer TMDB API on every keystroke

---

## 10. Environment Variables & Configuration

### Decision: Use .env file with dotenv for local dev, platform env vars for prod

**Required Environment Variables**:
```bash
# Server
PORT=4000
NODE_ENV=development

# External APIs
TMDB_API_KEY=your_tmdb_key_here
OMDB_API_KEY=your_omdb_key_here
TRAKT_CLIENT_ID=your_trakt_client_id_here

# CORS (development)
CORS_ORIGIN=http://localhost:5173
```

**Configuration Loading**:
```typescript
// server/config.ts
import { z } from 'zod';

const ConfigSchema = z.object({
  port: z.coerce.number().default(4000),
  nodeEnv: z.enum(['development', 'production']).default('development'),
  tmdbApiKey: z.string().min(1),
  omdbApiKey: z.string().min(1),
  traktClientId: z.string().min(1),
  corsOrigin: z.string().url().optional(),
});

export const config = ConfigSchema.parse({
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  tmdbApiKey: process.env.TMDB_API_KEY,
  omdbApiKey: process.env.OMDB_API_KEY,
  traktClientId: process.env.TRAKT_CLIENT_ID,
  corsOrigin: process.env.CORS_ORIGIN,
});
```

**Rationale**:
- Zod validation catches missing environment variables at startup
- Type-safe config object prevents runtime errors
- Single source of truth for configuration

---

## 11. Testing Strategy for Phase 1

### Decision: Focus on testing domain logic, skip full E2E

**What to test** (aligned with Constitution Principle IV):

1. **Domain Logic** (MUST TEST):
   - `lib/domain/aggregation.ts`: Rating aggregation from multiple providers
   - `lib/domain/episode-merge.ts`: Merging TMDB + Trakt episode ratings by season/episode number
   - Edge cases: missing data, mismatched episode counts, null handling

2. **Provider Normalization** (MUST TEST):
   - `server/providers/tmdb.ts`: Transforming TMDB API responses to internal types
   - Zod schema validation correctness
   - Null/undefined handling

3. **API Integration** (NICE TO HAVE):
   - Use Fastify `.inject()` to test search route without real HTTP
   - Mock provider responses with sample data

4. **React Components** (NICE TO HAVE):
   - 1-2 key components with @testing-library/react (e.g., SearchBar with loading states)

**Testing Tools**:
- Vitest for test runner
- @testing-library/react for React component tests (minimal)
- Fastify .inject() for API route testing

**Example Test**:
```typescript
// tests/domain/aggregation.test.ts
import { describe, it, expect } from 'vitest';
import { aggregateRatings } from '@/lib/domain/aggregation';

describe('aggregateRatings', () => {
  it('should merge ratings from all providers', async () => {
    const result = await aggregateRatings(1396, 'tv');
    expect(result.overall.tmdb).toBeDefined();
    expect(result.overall.imdb).toBeDefined();
    expect(result.overall.trakt).toBeDefined();
  });

  it('should handle partial provider failures gracefully', async () => {
    // Mock one provider failure
    const result = await aggregateRatings(99999, 'tv');
    expect(result.overall.tmdb).toBeNull();
    expect(result.overall.trakt).toBeDefined(); // Other providers still work
  });
});
```

---

## 12. Animation & UI Enhancements

### Decision: Use Framer Motion for optional micro-interactions

**What was chosen**: Framer Motion for hover states, transitions, and autocomplete animations

**Use Cases**:
- Search autocomplete dropdown: slide down animation
- Rating cards: hover scale (1.02x) with smooth transition
- Loading spinner: gentle rotation
- Season selector pills: active state transition

**Implementation Pattern**:
```typescript
import { motion } from 'framer-motion';

export function AutocompleteResults({ results }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {results.map(result => (
        <SearchResultItem key={result.id} result={result} />
      ))}
    </motion.div>
  );
}
```

**Rationale**:
- Specification requires animations be "optional and non-blocking"
- Framer Motion uses CSS transforms (GPU-accelerated, performant)
- Declarative API integrates cleanly with React

**Alternatives considered**:
- **CSS transitions only**: Considered, but Framer Motion provides better animation orchestration for complex sequences
- **React Spring**: Rejected because Framer Motion has simpler API for basic use cases

---

## 13. Date/Time Formatting

### Decision: Use date-fns for consistent date handling

**What was chosen**: date-fns library for formatting release years and dates

**Use Cases**:
- Format release year: `format(new Date(releaseDate), 'yyyy')`
- Display "Released in 2008" from TMDB date string

**Example**:
```typescript
import { format, parseISO } from 'date-fns';

export function formatReleaseYear(dateString: string | undefined): string {
  if (!dateString) return 'Unknown';
  try {
    return format(parseISO(dateString), 'yyyy');
  } catch {
    return 'Unknown';
  }
}
```

**Rationale**:
- Consistent date formatting across the application
- Avoids ad-hoc string manipulation
- Locale-aware if needed in future

---

## 14. CORS Configuration

### Decision: Configure CORS plugin in Fastify for local dev

**Configuration**:
```typescript
// server/plugins/cors.ts
import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { config } from '../config';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: config.corsOrigin || 'http://localhost:5173', // Vite dev server
    credentials: false, // No cookies in Phase 1
  });
};

export default corsPlugin;
```

**Rationale**:
- Frontend (localhost:5173) needs to call backend (localhost:4000)
- CORS plugin handles preflight requests automatically

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Provider Abstraction | Separate modules per API | Encapsulation, testability, swappability |
| TMDB API | v3 with Bearer auth | Generous rate limits, complete metadata |
| OMDb API | Free tier with IMDb ID lookup | Simple IMDb rating integration |
| Trakt API | v2 with Client ID (no OAuth) | Episode ratings, alternative rating source |
| Aggregation | Parallel with Promise.allSettled | Performance + graceful degradation |
| Episode Merge | Side-by-side TMDB + Trakt scores | Raw data display per spec (FR-015) |
| Error Handling | react-hot-toast notifications | Non-intrusive, auto-dismiss |
| Data Fetching | TanStack Query | Loading states, caching, deduplication |
| Search Debounce | Custom hook with 300ms delay | Reduces API calls, industry standard |
| Validation | Zod for API responses + config | Runtime safety + TypeScript types |
| Testing | Domain logic + provider normalization | Pragmatic strategy per constitution |
| Animations | Framer Motion (optional) | Performant, declarative, React-friendly |
| Date Formatting | date-fns | Consistent, locale-aware |
| CORS | @fastify/cors plugin | Local dev frontend ↔ backend communication |

---

## Open Questions (Deferred to Implementation)

- **API Key Management**: Use .env for now, consider secrets manager in production
- **Rate Limit Retry Logic**: Not implemented in Phase 1 (display error per FR-016a), can add exponential backoff later
- **Response Caching**: Phase 1 is stateless, no caching. Consider Redis in future phases
- **Request Timeout Handling**: Use default fetch timeout, add explicit timeouts if needed
- **Logging**: Use Fastify's built-in Pino logger, consider external service (Sentry) later

---

**Research Complete**: All technical decisions documented. Ready to proceed to Phase 1 (Design & Contracts).
