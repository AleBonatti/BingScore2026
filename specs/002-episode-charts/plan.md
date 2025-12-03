# Implementation Plan: BingeScore Phase 2 - Episode Rating Charts

**Branch**: `002-episode-charts` | **Date**: 2025-12-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-episode-charts/spec.md`

## Summary

Phase 2 extends the existing BingeScore application (Phase 1) by adding visual episode rating charts for TV series. Users will be able to view line charts showing TMDB and Trakt ratings for each episode in a season, making it easy to identify standout episodes and rating trends at a glance. The implementation uses Recharts library for visualization and reuses the existing episode data aggregation from Phase 1 without any backend API changes.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 18+ LTS
**Primary Dependencies**: React 18+, Recharts (new), Fastify, Tailwind CSS v4, Framer Motion
**Storage**: N/A (Phase 1 already handles episode data via external APIs - TMDB, Trakt)
**Testing**: Vitest for unit tests, @testing-library/react for component tests
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - modern versions)
**Project Type**: Full-stack web application (React SPA + Fastify backend)
**Performance Goals**: Chart render <100ms, season switch <1 second, tooltip hover <100ms
**Constraints**: Fixed 400px chart height, 0-10 Y-axis scale, no zoom/pan, 300ms fade-in animation
**Scale/Scope**: Single new frontend component (EpisodeChart), chart data transformation helper, integration into existing MediaDetailPage

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ TypeScript-First Development
- All new code will use TypeScript strict mode
- Chart data transformation helper will have explicit type signatures
- Recharts component props will be fully typed
- No `any` types expected

### ✅ Simplicity & No Over-Engineering
- Single new component for chart visualization
- Simple data transformation (map `EpisodeRatingEntry[]` to chart format)
- No new architectural patterns introduced
- Recharts chosen as it's lightweight and React-native

### ✅ Fastify Server Architecture
- **NO backend changes required** - Phase 1 already provides `episodesBySeason` data
- Existing `/api/media/aggregate` endpoint returns all necessary episode data
- No new API routes, no plugin changes, no server modifications

### ✅ Pragmatic Testing Strategy
- Chart data transformation helper MUST be tested (pure function, business logic)
- Chart component NICE TO HAVE: verify correct data shape passed to Recharts
- No E2E tests for initial version

### ✅ Dev/Prod Parity
- Recharts added to `package.json` as production dependency
- No environment-specific configuration needed
- Chart works identically in dev and prod

### ✅ Technology Stack Compliance
- React 18+ ✓ (existing)
- TypeScript ✓ (existing)
- Vite ✓ (existing, handles Recharts as ESM)
- Tailwind CSS v4 ✓ (existing, used for chart container styling)
- Recharts ✓ (new dependency, React-compatible chart library)

**Verdict**: ✅ ALL GATES PASS - No constitution violations. Phase 2 is a pure frontend extension.

## Project Structure

### Documentation (this feature)

```text
specs/002-episode-charts/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (N/A for this feature - no API changes)
├── checklists/          # Specification quality checklist
│   └── requirements.md  # Completed
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/                             # Frontend (React + Vite)
├── components/
│   ├── media/
│   │   ├── MediaDetailHeader.tsx        # Existing
│   │   ├── OverallRatingsPanel.tsx      # Existing (unused in Phase 2)
│   │   ├── RatingCard.tsx               # Existing
│   │   ├── SeasonSelector.tsx           # Existing
│   │   ├── EpisodeRatingsDisplay.tsx    # Existing (table view)
│   │   └── EpisodeChart.tsx             # NEW - Line chart component
│   └── ... (other existing components)
├── pages/
│   └── MediaDetailPage.tsx              # MODIFIED - Add chart above table
├── hooks/
│   ├── useMediaAggregation.ts           # Existing
│   └── useDebounce.ts                   # Existing
├── lib/
│   └── utils/
│       └── chart-data.ts                # NEW - Transform episode data for Recharts
└── ... (other existing files)

lib/                             # Shared code (frontend + backend)
└── types/
    └── domain.ts                        # Existing (no changes needed)

server/                          # Backend (Fastify) - NO CHANGES
└── ... (all existing, untouched)
```

**Structure Decision**: Phase 2 is entirely a frontend extension. No backend changes required because Phase 1 already provides `episodesBySeason` data through the existing `/api/media/aggregate` endpoint. New chart component will be added to `src/components/media/`, and a helper utility will transform episode data into Recharts-compatible format.

## Complexity Tracking

> Phase 2 has NO constitution violations - no complexity tracking needed.

## Phase 0: Research & Unknowns

### Research Tasks

1. **Recharts Integration with TypeScript + Tailwind**
   - **Question**: What are the Recharts component types and how to type them with strict TypeScript?
   - **Question**: How does Recharts handle missing data points (gaps in lines)?
   - **Question**: How to customize Recharts colors for dark mode compatibility?

2. **Chart Animation with Recharts**
   - **Question**: Does Recharts support fade-in animations, or do we need Framer Motion wrapper?
   - **Question**: What animation props control fade-in duration (300ms requirement)?

3. **Responsive Chart Design**
   - **Question**: How does ResponsiveContainer work with fixed 400px height?
   - **Question**: How to ensure chart readability on mobile (375px+ width)?

4. **Tooltip Customization**
   - **Question**: How to customize Recharts tooltip to show episode title + both TMDB and Trakt scores?
   - **Question**: How to handle "No rating available" text in tooltip for missing data?

5. **Chart Data Transformation**
   - **Question**: What exact data shape does Recharts LineChart expect for two series?
   - **Question**: How to handle episodes with missing TMDB or Trakt scores (null values)?

**Research Output**: See [research.md](./research.md) (to be generated in next step)

## Phase 1: Design & Contracts

### Data Model

**Existing Types** (no changes):
- `EpisodeRatingEntry`: `{ seasonNumber, episodeNumber, title, tmdbScore, traktScore }`
- `AggregatedRatings`: Contains `episodesBySeason?: { [seasonNumber: number]: EpisodeRatingEntry[] }`

**New Types**:
- `EpisodeChartPoint`: Data shape for Recharts
  ```typescript
  interface EpisodeChartPoint {
    episode: number;           // Episode number for X-axis
    title: string;             // Episode title for tooltip
    tmdb: number | null;       // TMDB score (0-10) or null
    trakt: number | null;      // Trakt score (0-10) or null
  }
  ```

### API Contracts

**NO NEW ENDPOINTS** - Phase 1 already provides all necessary data:

**Existing Endpoint** (used as-is):
```
GET /api/media/aggregate?tmdbId={id}&mediaType={type}

Response:
{
  ids: { ... },
  title: string,
  year: number,
  mediaType: 'movie' | 'tv',
  overview: string,
  posterUrl: string,
  overall: { tmdb, imdb, trakt },
  episodesBySeason?: {           // ← Already includes episode data
    [seasonNumber: number]: {
      seasonNumber: number,
      episodeNumber: number,
      title: string,
      tmdbScore: number | null,
      traktScore: number | null
    }[]
  }
}
```

Phase 2 simply adds a visual chart representation of the `episodesBySeason` data that Phase 1 already provides.

### Component Architecture

**New Component: EpisodeChart**
- **Purpose**: Render line chart with TMDB and Trakt ratings
- **Props**:
  ```typescript
  interface EpisodeChartProps {
    episodes: EpisodeRatingEntry[];  // From episodesBySeason[seasonNumber]
    seasonNumber: number;            // For display purposes
    isLoading?: boolean;             // Loading state
  }
  ```
- **Responsibilities**:
  - Transform `EpisodeRatingEntry[]` → `EpisodeChartPoint[]` (via helper)
  - Render Recharts LineChart with ResponsiveContainer
  - Configure TMDB line (blue) and Trakt line (red)
  - Handle missing data (connectNulls or dot markers)
  - Apply 300ms fade-in animation
  - Support dark mode via Tailwind CSS classes

**Modified Component: MediaDetailPage**
- Add `<EpisodeChart>` above `<EpisodeRatingsDisplay>` (table)
- Pass `episodesBySeason[selectedSeason]` to both chart and table
- Maintain season selector functionality (already exists)

**New Utility: chart-data.ts**
- Function: `transformEpisodesToChartData(episodes: EpisodeRatingEntry[]): EpisodeChartPoint[]`
- **Pure function** (no side effects)
- Maps episode array to chart-friendly format
- Handles null scores appropriately
- MUST BE TESTED (pure business logic)

## Phase 2: Implementation Tasks

### Task Breakdown

#### Setup & Dependencies (1 task)

**T001: Install Recharts dependency**
- Add `recharts` to `package.json` as production dependency
- Verify TypeScript types available (`@types/recharts` or built-in)
- Test import in a temporary file to ensure no build errors
- **Acceptance**: `npm install` succeeds, `import { LineChart } from 'recharts'` compiles without errors

#### Data Transformation (2 tasks)

**T002: Create chart data transformation utility**
- Create `src/lib/utils/chart-data.ts`
- Implement `transformEpisodesToChartData()` function
- Handle null scores (keep as null for Recharts to skip)
- Sort episodes by episodeNumber (ensure correct X-axis order)
- **Acceptance**: Function takes `EpisodeRatingEntry[]` and returns `EpisodeChartPoint[]` with correct shape

**T003: Write tests for chart data transformation**
- Create `src/lib/utils/chart-data.test.ts`
- Test cases:
  - Normal case: all episodes have both TMDB and Trakt scores
  - Missing Trakt: some episodes have only TMDB scores
  - Missing TMDB: some episodes have only Trakt scores
  - Empty array: returns empty array
  - Unsorted episodes: output is sorted by episode number
- **Acceptance**: All tests pass, coverage includes edge cases

#### Chart Component (4 tasks)

**T004: Create EpisodeChart component skeleton**
- Create `src/components/media/EpisodeChart.tsx`
- Define `EpisodeChartProps` interface
- Set up ResponsiveContainer with 400px height
- Add loading state (skeleton or spinner)
- Add empty state (no episodes)
- **Acceptance**: Component renders without errors, handles loading/empty states

**T005: Implement Recharts LineChart with TMDB and Trakt lines**
- Import LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid from Recharts
- Configure X-axis (episode numbers)
- Configure Y-axis (0-10 scale, domain: [0, 10])
- Add TMDB line (stroke: blue, connectNulls: false)
- Add Trakt line (stroke: red, connectNulls: false)
- Add CartesianGrid for better readability
- Add Legend to identify TMDB vs Trakt
- **Acceptance**: Chart renders with two lines, X-axis shows episode numbers, Y-axis shows 0-10

**T006: Customize tooltip to show episode title and both ratings**
- Implement custom Tooltip component
- Display format: "Episode {number}: {title}" + "TMDB: {score}/10" + "Trakt: {score}/10"
- Handle missing scores: show "N/A" or "No rating available"
- Style tooltip with Tailwind (dark mode compatible)
- **Acceptance**: Hovering over data points shows custom tooltip with episode info

**T007: Add dark mode support and 300ms fade-in animation**
- Add Tailwind dark mode classes to chart container
- Configure Recharts stroke colors for dark mode (use CSS variables or conditional props)
- Wrap LineChart in motion.div with fade-in animation (Framer Motion)
- Set animation duration to 300ms
- Test in light and dark modes
- **Acceptance**: Chart adapts to dark mode, animates smoothly on mount and season change

#### Integration (2 tasks)

**T008: Integrate EpisodeChart into MediaDetailPage**
- Import EpisodeChart component
- Add chart above EpisodeRatingsDisplay (table)
- Pass `episodesBySeason[selectedSeason]` to chart
- Ensure chart updates when season changes
- Add conditional rendering (only show if episodesBySeason exists)
- **Acceptance**: Chart appears on TV series detail pages, updates when season selector changes

**T009: Test end-to-end with real data (Breaking Bad)**
- Navigate to Breaking Bad detail page (`/media/tv/1396`)
- Verify chart renders with Season 1 episodes
- Switch to Season 2, verify chart updates
- Test with series with missing Trakt data
- Test responsive behavior (resize browser, test on mobile width)
- Verify tooltip shows correct episode info
- Verify dark mode toggle works
- **Acceptance**: All manual tests pass, chart functions correctly with real data

### Task Dependencies

```
T001 (Install Recharts)
 ↓
T002 (Transform utility) → T003 (Test utility)
 ↓
T004 (Chart skeleton)
 ↓
T005 (LineChart implementation)
 ↓
T006 (Custom tooltip)
 ↓
T007 (Dark mode + animation)
 ↓
T008 (MediaDetailPage integration)
 ↓
T009 (End-to-end testing)
```

**Critical Path**: T001 → T002 → T004 → T005 → T008 → T009
**Parallel Work**: T003 can be done alongside T004-T007

### Milestones

#### Milestone 1: Foundation Ready
**Definition**: Recharts installed, data transformation utility complete and tested
**Includes**: T001, T002, T003
**Verification**: `npm run test` passes, chart data helper works correctly

#### Milestone 2: Basic Chart Rendering
**Definition**: EpisodeChart component renders with two lines (TMDB and Trakt)
**Includes**: T004, T005
**Verification**: Chart visible in isolation (Storybook or temporary test page)

#### Milestone 3: Chart Polish
**Definition**: Custom tooltip, dark mode, animation complete
**Includes**: T006, T007
**Verification**: Chart fully styled, interactive, adapts to theme

#### Milestone 4: Production Ready
**Definition**: Chart integrated into MediaDetailPage, tested with real data
**Includes**: T008, T009
**Verification**: All acceptance scenarios from spec.md pass

## Deliverables

### Definition of Done

Phase 2 is complete when:

1. ✅ **Recharts dependency installed** and TypeScript types available
2. ✅ **Chart data transformation utility** implemented and tested (100% coverage)
3. ✅ **EpisodeChart component** renders line chart with TMDB and Trakt lines
4. ✅ **Custom tooltip** shows episode number, title, and both ratings
5. ✅ **Dark mode support** works correctly (chart colors adapt)
6. ✅ **300ms fade-in animation** plays on mount and season change
7. ✅ **MediaDetailPage integration** complete (chart above table)
8. ✅ **All acceptance scenarios** from spec.md pass:
   - Chart visible on TV series detail pages
   - Chart updates when switching seasons
   - Tooltip appears on hover with correct info
   - Missing data handled gracefully (gaps in lines)
   - Responsive on mobile (375px+ width)
   - Y-axis always 0-10 scale
   - Chart positioned above table, below overall ratings
9. ✅ **No regressions** - existing table view still works
10. ✅ **TypeScript compiles** with no errors (`npm run typecheck`)
11. ✅ **All tests pass** (`npm run test`)

### Artifacts

- `src/components/media/EpisodeChart.tsx` - Chart component
- `src/lib/utils/chart-data.ts` - Data transformation utility
- `src/lib/utils/chart-data.test.ts` - Unit tests
- Updated `src/pages/MediaDetailPage.tsx` - Chart integration
- Updated `package.json` - Recharts dependency

### Out of Scope (Phase 2)

- Average rating line or trend lines
- Episode-specific notes or commentary
- Filtering or sorting within the chart
- Export chart as image
- Comparison across multiple TV series
- User annotations or bookmarks
- Chart zooming or panning
- Backend changes (all data already available)
- New API endpoints (not needed)

## Risk Assessment

### Low Risk
- ✅ No backend changes (reduces risk significantly)
- ✅ Recharts is mature, widely used library
- ✅ Data transformation is pure function (easy to test)
- ✅ Chart is supplementary to table (table remains as fallback)

### Medium Risk
- ⚠️ Recharts TypeScript types may require adjustment
  - **Mitigation**: Test types early in T001
- ⚠️ Dark mode color adaptation may need CSS variable tuning
  - **Mitigation**: Test in both modes during T007

### Negligible Risk
- Chart performance (Recharts is performant for <25 episodes)
- Animation jank (300ms is conservative, Framer Motion is smooth)
- Responsive design (ResponsiveContainer handles this)

## Next Steps

1. ✅ **Complete this plan** (current step)
2. **Run Phase 0**: Generate `research.md` with Recharts integration research
3. **Run Phase 1**: Generate `data-model.md` (document `EpisodeChartPoint` type)
4. **Run Phase 1**: Generate `quickstart.md` (how to add chart to new pages)
5. **Exit planning**: Use `/speckit.tasks` to generate `tasks.md` with detailed implementation tasks

---

**Status**: Planning complete, ready for Phase 0 research
**Estimated Effort**: 4-6 hours (1 chart component + 1 helper utility + integration)
**Complexity**: Low (pure frontend extension, no backend changes)
