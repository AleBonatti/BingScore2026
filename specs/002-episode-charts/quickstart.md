# Quick Start: Episode Rating Charts

**Feature**: Episode Rating Charts for TV Series
**Branch**: `002-episode-charts`
**Prerequisites**: Phase 1 (search and ratings aggregation) must be complete

## What This Feature Adds

Phase 2 adds visual line charts showing TMDB and Trakt episode ratings for TV series. The charts appear on TV series detail pages, positioned above the episode ratings table.

## Key Components

### 1. EpisodeChart Component

**Location**: `src/components/media/EpisodeChart.tsx`

**Purpose**: Renders a Recharts LineChart with TMDB (blue) and Trakt (red) rating lines.

**Props**:
```typescript
interface EpisodeChartProps {
  episodes: EpisodeRatingEntry[];  // Episode data from API
  seasonNumber: number;            // Current season number
  isLoading?: boolean;             // Loading state
}
```

**Usage**:
```tsx
import EpisodeChart from '@/components/media/EpisodeChart';

<EpisodeChart
  episodes={episodesBySeason[selectedSeason]}
  seasonNumber={selectedSeason}
  isLoading={isLoading}
/>
```

### 2. Chart Data Transformation

**Location**: `src/lib/utils/chart-data.ts`

**Purpose**: Transform Phase 1 episode data into Recharts-compatible format.

**Function**:
```typescript
function transformEpisodesToChartData(
  episodes: EpisodeRatingEntry[]
): EpisodeChartPoint[]
```

**Example**:
```typescript
import { transformEpisodesToChartData } from '@/lib/utils/chart-data';

const episodes: EpisodeRatingEntry[] = [
  { seasonNumber: 1, episodeNumber: 1, title: "Pilot", tmdbScore: 8.5, traktScore: 8.2 },
  { seasonNumber: 1, episodeNumber: 2, title: "Episode 2", tmdbScore: 8.7, traktScore: null },
];

const chartData = transformEpisodesToChartData(episodes);
// Result:
// [
//   { episode: 1, title: "Pilot", tmdb: 8.5, trakt: 8.2 },
//   { episode: 2, title: "Episode 2", tmdb: 8.7, trakt: null },
// ]
```

## Integration into Existing Pages

### MediaDetailPage (TV Series)

The chart is already integrated into `MediaDetailPage.tsx` for TV series. Here's the pattern:

```tsx
{data.mediaType === 'tv' && data.episodesBySeason && seasons.length > 0 && (
  <div className="mt-8">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Episode Ratings
    </h2>

    <SeasonSelector
      seasons={seasons}
      selectedSeason={selectedSeason}
      onSelectSeason={setSelectedSeason}
    />

    {/* Chart positioned above table */}
    <EpisodeChart
      episodes={data.episodesBySeason[selectedSeason] || []}
      seasonNumber={selectedSeason}
      isLoading={isLoading}
    />

    {/* Existing table view below chart */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <EpisodeRatingsDisplay
        episodes={data.episodesBySeason[selectedSeason] || []}
        seasonNumber={selectedSeason}
      />
    </div>
  </div>
)}
```

**Key points**:
- Chart appears **above** the episode table
- Chart receives same `episodes` array as the table
- Chart updates when `selectedSeason` changes (via SeasonSelector)
- Chart only shown for TV series (`mediaType === 'tv'`)

## Adding Charts to New Pages

If you want to add episode charts to a new page (e.g., comparison view, favorites):

1. **Fetch episode data** using existing Phase 1 API:
   ```typescript
   const { data } = useMediaAggregation(tmdbId, 'tv');
   const episodes = data?.episodesBySeason?.[seasonNumber] || [];
   ```

2. **Import and render EpisodeChart**:
   ```tsx
   import EpisodeChart from '@/components/media/EpisodeChart';

   <EpisodeChart
     episodes={episodes}
     seasonNumber={seasonNumber}
   />
   ```

3. **Add season selector** (optional, if showing multiple seasons):
   ```tsx
   import SeasonSelector from '@/components/media/SeasonSelector';

   const seasons = Object.keys(data.episodesBySeason).map(Number).sort();
   const [selectedSeason, setSelectedSeason] = useState(seasons[0] || 1);

   <SeasonSelector
     seasons={seasons}
     selectedSeason={selectedSeason}
     onSelectSeason={setSelectedSeason}
   />
   ```

## Chart Behavior

### Loading State
When `isLoading={true}`, the chart displays a skeleton loader with animation.

### Empty State
When `episodes={[]}`, the chart displays "No episode data available" message.

### Missing Data
When some episodes have `null` scores:
- Chart renders available data points
- Missing data creates **gaps** in the line (Recharts `connectNulls={false}`)
- Tooltip shows "N/A" or "No rating available" for missing scores

### Dark Mode
Chart automatically adapts to dark mode:
- Background: dark gray
- Grid lines: lighter in dark mode
- Text: white in dark mode
- Line colors remain consistent (blue for TMDB, red for Trakt)

### Animation
Chart fades in with 300ms duration:
- On initial render
- When switching seasons
- When data updates

## Data Requirements

**No API changes needed** - Phase 2 uses existing Phase 1 data:

- Endpoint: `GET /api/media/aggregate?tmdbId={id}&mediaType=tv`
- Response field: `episodesBySeason`
- Data type: `{ [seasonNumber: number]: EpisodeRatingEntry[] }`

**EpisodeRatingEntry** (Phase 1 type, unchanged):
```typescript
interface EpisodeRatingEntry {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  tmdbScore: number | null;
  traktScore: number | null;
}
```

## Testing the Chart

### Manual Testing

1. Navigate to Breaking Bad detail page: `/media/tv/1396`
2. Verify chart renders with Season 1 episodes
3. Click "Season 2" button, verify chart updates
4. Hover over data points, verify tooltip shows episode info
5. Toggle dark mode, verify chart colors adapt
6. Test on mobile (resize browser to 375px), verify responsive layout

### Unit Testing

Test the transformation utility:

```typescript
import { transformEpisodesToChartData } from '@/lib/utils/chart-data';

describe('transformEpisodesToChartData', () => {
  it('transforms episodes to chart format', () => {
    const episodes = [
      { seasonNumber: 1, episodeNumber: 1, title: "Pilot", tmdbScore: 8.5, traktScore: 8.2 },
    ];
    const result = transformEpisodesToChartData(episodes);
    expect(result).toEqual([
      { episode: 1, title: "Pilot", tmdb: 8.5, trakt: 8.2 },
    ]);
  });

  it('handles null scores', () => {
    const episodes = [
      { seasonNumber: 1, episodeNumber: 1, title: "Pilot", tmdbScore: 8.5, traktScore: null },
    ];
    const result = transformEpisodesToChartData(episodes);
    expect(result[0].trakt).toBeNull();
  });
});
```

See `src/lib/utils/chart-data.test.ts` for full test suite.

## Dependencies

**New dependency** (added in Phase 2):
- `recharts`: ^3.5.1 (or latest stable)

**Installation**:
```bash
npm install recharts
```

TypeScript types are **built-in** with Recharts v3.5.1+, no need for `@types/recharts`.

## Common Issues

### Chart not appearing
- Check `mediaType === 'tv'` (charts only for TV series)
- Verify `episodesBySeason` exists in API response
- Check browser console for errors

### Chart not updating on season change
- Ensure `selectedSeason` state is passed correctly
- Verify `episodes` prop changes when season selector updates
- Check React DevTools for prop changes

### Dark mode colors incorrect
- Verify `@variant dark (&:where(.dark, .dark *))` in `globals.css`
- Check Tailwind CSS v4 stable is installed (v4.1.17+)

### Animation not smooth
- Verify Framer Motion is installed
- Check browser performance (300ms animation may skip frames on slow devices)

## Next Steps

After completing Phase 2:
1. Run tests: `npm run test`
2. Verify TypeScript compiles: `npm run typecheck`
3. Test manually with multiple TV series
4. Check responsive design on mobile
5. Verify dark mode works correctly

## Related Documentation

- **Feature Spec**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Research Findings**: [research.md](./research.md)
- **Phase 1 Spec**: `/specs/001-search-ratings-aggregation/spec.md`
