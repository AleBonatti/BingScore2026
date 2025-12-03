# Data Model: BingeScore Phase 2 - Episode Rating Charts

**Feature**: Episode Rating Charts
**Branch**: `002-episode-charts`
**Created**: 2025-12-03

## Overview

Phase 2 introduces a new chart visualization layer on top of Phase 1's existing episode data model. No changes to backend data structures or database schema are required. This document defines the **frontend-specific** data transformation types used to adapt Phase 1 episode data for Recharts visualization.

## Existing Data Model (Phase 1)

### EpisodeRatingEntry

**Source**: `lib/types/domain.ts` (unchanged)

```typescript
interface EpisodeRatingEntry {
  seasonNumber: number;        // Season number (1, 2, 3, ...)
  episodeNumber: number;       // Episode number within season (1, 2, 3, ...)
  title: string;               // Episode title (e.g., "Pilot", "Ozymandias")
  tmdbScore: number | null;    // TMDB rating (0-10 scale) or null if unavailable
  traktScore: number | null;   // Trakt rating (0-10 scale) or null if unavailable
}
```

**Validation Rules**:
- `seasonNumber` must be positive integer ≥ 0 (Season 0 = specials)
- `episodeNumber` must be positive integer ≥ 1
- `title` may be empty string for episodes without titles
- `tmdbScore` and `traktScore` are nullable (null = no rating available)
- Scores, when present, must be in range 0-10 (inclusive)

**Source**: Phase 1 aggregates this data from TMDB and Trakt APIs via `lib/domain/episode-merge.ts`

### AggregatedRatings

**Source**: `lib/types/domain.ts` (unchanged)

```typescript
interface AggregatedRatings {
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
  episodesBySeason?: {                         // ← Phase 2 uses this
    [seasonNumber: number]: EpisodeRatingEntry[];
  };
}
```

**Relationship**: `episodesBySeason` is an **optional** field populated only for TV series (`mediaType: 'tv'`). Movies do not have this field.

## New Data Model (Phase 2)

### EpisodeChartPoint

**Purpose**: Frontend-only data shape optimized for Recharts LineChart visualization.

**Location**: `src/lib/utils/chart-data.ts` (new file)

```typescript
/**
 * Chart-optimized representation of an episode rating.
 * Used by Recharts LineChart to render TMDB and Trakt lines.
 */
interface EpisodeChartPoint {
  /** Episode number (X-axis) */
  episode: number;

  /** Episode title for tooltip display */
  title: string;

  /** TMDB rating (Y-axis, blue line) or null if unavailable */
  tmdb: number | null;

  /** Trakt rating (Y-axis, red line) or null if unavailable */
  trakt: number | null;
}
```

**Key Differences from EpisodeRatingEntry**:
- `episode` replaces `episodeNumber` (simpler property name for Recharts dataKey)
- `seasonNumber` omitted (season is contextual, not plotted on chart)
- `tmdbScore`/`traktScore` renamed to `tmdb`/`trakt` (shorter dataKey for Recharts)

**Validation Rules**:
- `episode` must match `episodeNumber` from source `EpisodeRatingEntry`
- `title` must match `title` from source `EpisodeRatingEntry`
- `tmdb` and `trakt` maintain same nullability and range (0-10 or null)
- Array of `EpisodeChartPoint` must be **sorted by `episode` ascending** for correct X-axis rendering

## Data Transformations

### Transform: EpisodeRatingEntry[] → EpisodeChartPoint[]

**Function**: `transformEpisodesToChartData(episodes: EpisodeRatingEntry[]): EpisodeChartPoint[]`

**Location**: `src/lib/utils/chart-data.ts`

**Purpose**: Convert Phase 1 episode data into Recharts-compatible format.

**Algorithm**:
1. Map each `EpisodeRatingEntry` to `EpisodeChartPoint`
2. Extract `episodeNumber` → `episode`
3. Copy `title` as-is
4. Copy `tmdbScore` → `tmdb` (keep null values)
5. Copy `traktScore` → `trakt` (keep null values)
6. Sort result by `episode` ascending

**Pseudocode**:
```typescript
function transformEpisodesToChartData(episodes: EpisodeRatingEntry[]): EpisodeChartPoint[] {
  return episodes
    .map(ep => ({
      episode: ep.episodeNumber,
      title: ep.title || `Episode ${ep.episodeNumber}`, // Fallback for missing titles
      tmdb: ep.tmdbScore,
      trakt: ep.traktScore,
    }))
    .sort((a, b) => a.episode - b.episode);
}
```

**Edge Cases**:
- **Empty array**: Returns `[]` (empty chart)
- **Null scores**: Preserves null (Recharts renders gap with `connectNulls` prop)
- **Missing titles**: Uses fallback `"Episode {number}"`
- **Unsorted input**: Output is always sorted by episode number

**Testing Requirements**:
- ✅ Test normal case: all episodes have both scores
- ✅ Test missing TMDB: some episodes have null tmdbScore
- ✅ Test missing Trakt: some episodes have null traktScore
- ✅ Test empty array: returns []
- ✅ Test unsorted input: output is sorted
- ✅ Test title fallback: missing title uses "Episode {number}"

## Data Flow

```
Phase 1 Backend (Fastify)
  ↓
/api/media/aggregate
  ↓
{ episodesBySeason: { [season]: EpisodeRatingEntry[] } }
  ↓
Frontend (React) - useMediaAggregation hook
  ↓
MediaDetailPage component
  ↓
<EpisodeChart episodes={episodesBySeason[selectedSeason]} />
  ↓
transformEpisodesToChartData(episodes)
  ↓
EpisodeChartPoint[]
  ↓
Recharts LineChart component
  ↓
<Line dataKey="tmdb" />
<Line dataKey="trakt" />
```

## No Database Schema Changes

Phase 2 does NOT introduce any database schema changes because:
- Episode data is fetched from **external APIs** (TMDB, Trakt) in real-time
- No persistent storage of episode ratings (Phase 1 decision)
- All data transformations happen **in-memory** on the frontend
- Backend API (`/api/media/aggregate`) is **unchanged**

## Type Exports

**Existing Exports** (unchanged):
```typescript
// lib/types/domain.ts
export type EpisodeRatingEntry = { ... };
export type AggregatedRatings = { ... };
```

**New Exports**:
```typescript
// src/lib/utils/chart-data.ts (new file)
export interface EpisodeChartPoint {
  episode: number;
  title: string;
  tmdb: number | null;
  trakt: number | null;
}

export function transformEpisodesToChartData(
  episodes: EpisodeRatingEntry[]
): EpisodeChartPoint[];
```

## Usage Example

```typescript
import { transformEpisodesToChartData, EpisodeChartPoint } from '@/lib/utils/chart-data';
import type { EpisodeRatingEntry } from '@/lib/types/domain';

// Phase 1 data from API
const episodesFromAPI: EpisodeRatingEntry[] = [
  { seasonNumber: 1, episodeNumber: 1, title: "Pilot", tmdbScore: 8.5, traktScore: 8.2 },
  { seasonNumber: 1, episodeNumber: 2, title: "Cat's in the Bag...", tmdbScore: 8.7, traktScore: null },
  { seasonNumber: 1, episodeNumber: 3, title: "...And the Bag's in the River", tmdbScore: null, traktScore: 8.5 },
];

// Transform for chart
const chartData: EpisodeChartPoint[] = transformEpisodesToChartData(episodesFromAPI);

// Result:
// [
//   { episode: 1, title: "Pilot", tmdb: 8.5, trakt: 8.2 },
//   { episode: 2, title: "Cat's in the Bag...", tmdb: 8.7, trakt: null },
//   { episode: 3, title: "...And the Bag's in the River", tmdb: null, trakt: 8.5 },
// ]

// Use in Recharts
<LineChart data={chartData}>
  <XAxis dataKey="episode" />
  <YAxis domain={[0, 10]} />
  <Line dataKey="tmdb" stroke="#3b82f6" connectNulls />
  <Line dataKey="trakt" stroke="#ef4444" connectNulls />
</LineChart>
```

## Summary

| Aspect | Details |
|--------|---------|
| **New Types** | `EpisodeChartPoint` (frontend-only) |
| **Existing Types** | `EpisodeRatingEntry`, `AggregatedRatings` (unchanged) |
| **New Files** | `src/lib/utils/chart-data.ts` (transformation utility) |
| **Modified Files** | None (pure addition) |
| **Database Changes** | None (data from external APIs) |
| **Backend Changes** | None (API unchanged) |
| **Testing Required** | `chart-data.test.ts` (transformation logic) |

## References

- **Phase 1 Spec**: `/specs/001-search-ratings-aggregation/spec.md`
- **Phase 1 Data Model**: Implicitly defined in `lib/types/domain.ts`
- **Phase 2 Spec**: `/specs/002-episode-charts/spec.md`
- **Phase 2 Plan**: `/specs/002-episode-charts/plan.md`
- **Recharts Research**: `/specs/002-episode-charts/research.md`
