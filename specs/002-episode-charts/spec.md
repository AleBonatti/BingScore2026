# Feature Specification: BingeScore Phase 2 - Episode Rating Charts

**Feature Branch**: `002-episode-charts`
**Created**: 2025-12-03
**Status**: Draft
**Input**: User description: "Phase 2: Episode Rating Charts - Add visual charts for TV show episode ratings using Recharts library"

## Context: Phase 1 Foundation

Phase 1 (completed) established:
- Anonymous usage with no database
- Fastify backend aggregating TMDB/OMDb/Trakt ratings
- React + TypeScript + Vite + Tailwind + Lucide frontend
- Text-only ratings display for both overall and episode-level data
- Episode ratings displayed in table format with TMDB and Trakt scores side-by-side

Phase 2 extends Phase 1 by adding visual charts for episode ratings without changing any existing Phase 1 behavior or constraints.

## Clarifications

### Session 2025-12-03

- Q: Should the chart support keyboard navigation and screen reader announcements for accessibility? → A: No accessibility features needed (chart is supplementary to table, which remains accessible)
- Q: Should the chart animate when it first appears or when switching between seasons? → A: Subtle fade-in animation (300ms) when chart appears or updates

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Episode Ratings Chart for TV Series (Priority: P1)

When viewing a TV series detail page, a user sees a line chart visualizing episode ratings across a selected season. The chart displays two lines: one for TMDB ratings and one for Trakt ratings, allowing users to quickly identify standout episodes, rating trends, and consensus (or disagreement) between the two platforms.

**Why this priority**: This is the core value of Phase 2. Visual charts make patterns immediately obvious that are hard to spot in tables (e.g., "the finale dropped in ratings" or "episode 5 was universally loved"). This transforms raw data into actionable insights.

**Independent Test**: Can be fully tested by navigating to any TV series detail page (e.g., Breaking Bad), selecting a season from the season selector, and verifying that a line chart appears showing TMDB and Trakt ratings for each episode in that season. Delivers immediate value by making episode quality trends visually apparent.

**Acceptance Scenarios**:

1. **Given** I am viewing a TV series detail page (e.g., Breaking Bad), **When** the page loads and episode data is available, **Then** I see a line chart below the overall ratings showing episode-by-episode ratings for Season 1 by default
2. **Given** I am viewing the episode chart for Season 1, **When** I hover over a data point, **Then** I see a tooltip showing the episode number, episode title, and exact ratings from TMDB and Trakt
3. **Given** the episode chart is displayed, **When** I look at the chart legend, **Then** I see two distinct lines clearly labeled "TMDB" and "Trakt" with different colors
4. **Given** I am viewing an episode chart, **When** both TMDB and Trakt have ratings for most episodes, **Then** I can easily compare the two rating sources across the season arc

---

### User Story 2 - Switch Between Seasons in Chart View (Priority: P2)

When viewing a TV series with multiple seasons, a user can select different seasons using the season selector. When they select a new season, the chart updates to display episode ratings for that season, maintaining the same visual format and allowing easy comparison across seasons.

**Why this priority**: Multi-season shows require navigation between seasons to see the full picture. Without this, users can only view one season and miss important trends (e.g., "Season 4 had higher ratings than Season 1"). This is essential for comprehensive analysis but secondary to seeing any chart at all.

**Independent Test**: Can be fully tested by navigating to a multi-season TV series (e.g., Breaking Bad with 5 seasons), clicking on different season buttons, and verifying that the chart updates to show the correct episode ratings for each selected season. Delivers value by enabling cross-season comparison.

**Acceptance Scenarios**:

1. **Given** I am viewing the episode chart for Breaking Bad Season 1, **When** I click the "Season 2" button, **Then** the chart updates to show episode ratings for Season 2
2. **Given** I am viewing Season 3 of a TV series, **When** I switch to Season 1, **Then** the chart displays all episodes from Season 1 with their respective TMDB and Trakt ratings
3. **Given** I switch between multiple seasons, **When** each chart loads, **Then** the Y-axis scale remains consistent (0-10) for easy visual comparison across seasons
4. **Given** I select a season with fewer episodes than the previous season, **When** the chart updates, **Then** the X-axis adjusts to show only the episodes in the selected season

---

### User Story 3 - Handle Missing Episode Data Gracefully (Priority: P3)

When viewing episode charts for TV series where some episodes lack ratings from one or both providers, the chart displays the available data clearly while indicating gaps. This ensures users can still gain insights from partial data without confusion.

**Why this priority**: Not all episodes have ratings from all providers, especially for new seasons or niche shows. Graceful handling prevents broken charts and maintains user trust, but this is less critical than displaying charts when data is complete.

**Independent Test**: Can be fully tested by navigating to a TV series where some episodes lack Trakt ratings (common for newer shows), selecting the relevant season, and verifying that the chart displays TMDB data while showing gaps or indicators for missing Trakt data. Delivers value by maintaining chart usability even with incomplete data.

**Acceptance Scenarios**:

1. **Given** I am viewing a season where some episodes have TMDB ratings but no Trakt ratings, **When** the chart renders, **Then** I see a complete TMDB line and a Trakt line with gaps where data is missing
2. **Given** an episode has no rating from either provider, **When** the chart displays, **Then** the episode number still appears on the X-axis but no data points are shown for that episode
3. **Given** a season has ratings from only one provider (e.g., only TMDB), **When** the chart loads, **Then** I see only the TMDB line and the legend indicates Trakt data is unavailable
4. **Given** I hover over a missing data point, **When** the tooltip appears, **Then** it shows "No rating available" for the missing provider

---

### Edge Cases

- What happens when a TV series has no episode ratings at all (neither TMDB nor Trakt)? → Chart section should not be displayed; user only sees overall ratings
- What happens when a season has 20+ episodes (e.g., network TV shows)? → Chart should remain readable with proper X-axis spacing and zoom/scroll if necessary
- What happens when episode ratings are all very close (e.g., 8.5-8.7 range)? → Y-axis scale should auto-adjust to show meaningful variation while maintaining 0-10 reference
- What happens when loading episode data takes longer than expected? → Display loading state in chart area with spinner and message
- What happens when the chart library fails to render? → Display fallback message and preserve existing table view as backup

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a line chart for TV series episode ratings when episode data is available from at least one provider (TMDB or Trakt)
- **FR-002**: Chart MUST show two distinct lines: one for TMDB ratings and one for Trakt ratings, with clear visual differentiation (different colors)
- **FR-003**: Chart X-axis MUST display episode numbers, and Y-axis MUST display rating scores from 0 to 10
- **FR-004**: Chart MUST include interactive tooltips that appear on hover, showing episode number, episode title, and exact ratings from both providers
- **FR-005**: Chart MUST include a legend clearly identifying which line represents TMDB and which represents Trakt
- **FR-006**: System MUST allow users to switch between seasons using the existing season selector, updating the chart to display the selected season's episode ratings
- **FR-007**: Chart MUST handle missing data gracefully by displaying available data and indicating gaps for missing ratings
- **FR-008**: Chart MUST display in a responsive container that adapts to different screen sizes
- **FR-009**: Chart MUST support dark mode, adapting colors and styling to match the application's dark theme when enabled
- **FR-010**: Chart MUST display a loading state while episode data is being fetched
- **FR-011**: Chart MUST display an error message if episode data fails to load, while preserving the existing table view as a fallback
- **FR-012**: Chart MUST NOT be displayed for movies (only for TV series with episode data)
- **FR-013**: Chart MUST use the same episode data source (`episodesBySeason` in `AggregatedRatings`) that is currently used for the table view
- **FR-014**: System MUST maintain the existing table view below the chart, allowing users to see both visualizations together
- **FR-015**: Chart MUST be positioned above the episode table and below the overall ratings section
- **FR-016**: Chart MUST animate with a subtle fade-in effect (300ms duration) when first rendered and when switching between seasons

### Key Entities _(existing data structure from Phase 1)_

- **AggregatedRatings**: Contains `episodesBySeason` object mapping season numbers to arrays of `EpisodeRatingEntry`
- **EpisodeRatingEntry**: Represents a single episode with `seasonNumber`, `episodeNumber`, `title`, `tmdbScore` (nullable), and `traktScore` (nullable)
- **Chart Data Shape**: Derived from `episodesBySeason[seasonNumber]`, transformed into format compatible with Recharts:
  ```
  [
    { episode: 1, title: "Pilot", tmdb: 8.5, trakt: 8.2 },
    { episode: 2, title: "Cat's in the Bag...", tmdb: 8.7, trakt: 8.4 },
    ...
  ]
  ```

## Success Criteria _(mandatory)_

### Measurable Outcomes

> **Note**: SC-001, SC-003, and SC-004 are quantifiable performance metrics. SC-002, SC-005, SC-006, and SC-007 are qualitative acceptance criteria verified through manual testing and user validation.

- **SC-001**: Users can identify the highest and lowest rated episodes in a season within 3 seconds of viewing the chart (compared to 30+ seconds scanning a table)
- **SC-002**: Chart renders and displays episode data for seasons with up to 25 episodes without performance degradation _(qualitative - verified by manual testing with real data)_
- **SC-003**: Chart tooltips appear instantly (within 100ms) when hovering over data points
- **SC-004**: Users can switch between seasons and see the updated chart in under 1 second
- **SC-005**: 90% of TV series detail pages display episode charts successfully when episode data is available _(qualitative - estimated success rate based on data availability)_
- **SC-006**: Chart remains readable and functional on mobile devices (screen width 375px+) _(qualitative - verified by visual inspection at 375px, 768px, 1024px widths)_
- **SC-007**: Chart adapts to dark mode without visual artifacts or reduced readability _(qualitative - verified by visual inspection in both light and dark modes)_

## Assumptions

- Recharts library will be used for chart rendering (as specified in Phase 2 description)
- Chart will use standard Recharts components: `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `ResponsiveContainer`
- Episode data structure (`episodesBySeason`) from Phase 1 remains unchanged
- Chart colors will follow the existing color scheme: TMDB uses blue tones, Trakt uses red tones, consistent with Phase 1 rating cards
- Chart height will be fixed at approximately 400px for consistency
- Y-axis will always display 0-10 scale for consistency across all charts, regardless of actual rating distribution
- Chart will not support zooming or panning for Phase 2 (may be added in future phases if needed)
- Existing table view will remain as the authoritative source of detailed episode data; chart is supplementary visualization
- Chart does not require keyboard navigation or screen reader support, as the table view provides accessible alternative
- Chart will use Recharts' built-in animation support with 300ms fade-in duration for smooth visual transitions

## Out of Scope for Phase 2

- Average rating line or trend lines
- Episode-specific notes or commentary
- Filtering or sorting within the chart
- Export chart as image
- Comparison across multiple TV series
- User annotations or bookmarks on specific episodes
- Integration with streaming service availability data
