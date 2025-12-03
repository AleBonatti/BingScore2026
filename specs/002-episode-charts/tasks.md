# Tasks: Episode Rating Charts (Phase 2)

**Input**: Design documents from `/specs/002-episode-charts/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No tests requested in specification - implementation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/` at repository root
- **Backend**: No backend changes (Phase 1 already provides all necessary data)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create foundational utilities

- [x] T001 Install Recharts dependency: `npm install recharts` (verify TypeScript types are built-in, no @types/recharts needed)
- [x] T002 [P] Create chart data transformation utility in src/lib/utils/chart-data.ts with `transformEpisodesToChartData` function
- [x] T003 [P] Create chart data type definition `EpisodeChartPoint` in src/lib/utils/chart-data.ts (episode: number, title: string, tmdb: number|null, trakt: number|null)

**Checkpoint**: Foundation ready - Recharts installed, transformation utility exists

---

## Phase 2: User Story 1 - View Episode Ratings Chart for TV Series (Priority: P1) 🎯 MVP

**Goal**: Display a line chart with TMDB and Trakt episode ratings for a TV series season

**Independent Test**: Navigate to Breaking Bad detail page (`/media/tv/1396`), verify chart appears showing Season 1 episode ratings with two colored lines (blue for TMDB, red for Trakt)

### Implementation for User Story 1

- [x] T004 [P] [US1] Create EpisodeChart component skeleton in src/components/media/EpisodeChart.tsx (define props: episodes, seasonNumber, isLoading)
- [x] T005 [P] [US1] Create custom tooltip component in src/components/media/EpisodeChart.tsx (show episode number, title, TMDB score, Trakt score)
- [x] T006 [US1] Implement ResponsiveContainer wrapper in src/components/media/EpisodeChart.tsx (width="100%", height={400})
- [x] T007 [US1] Implement LineChart with XAxis and YAxis in src/components/media/EpisodeChart.tsx (XAxis dataKey="episode", YAxis domain=[0,10])
- [x] T008 [US1] Add TMDB Line component in src/components/media/EpisodeChart.tsx (stroke="#3b82f6", connectNulls, animationDuration={300})
- [x] T009 [US1] Add Trakt Line component in src/components/media/EpisodeChart.tsx (stroke="#ef4444", connectNulls, animationDuration={300})
- [x] T010 [US1] Add CartesianGrid and Legend to chart in src/components/media/EpisodeChart.tsx
- [x] T011 [US1] Implement data transformation call in src/components/media/EpisodeChart.tsx (use transformEpisodesToChartData from chart-data.ts)
- [x] T012 [US1] Add loading state skeleton to EpisodeChart in src/components/media/EpisodeChart.tsx (show spinner when isLoading=true)
- [x] T013 [US1] Add empty state and error handling to EpisodeChart in src/components/media/EpisodeChart.tsx (hide chart when episodes array is empty, show error message if chart fails to render)
- [x] T014 [US1] Integrate EpisodeChart into MediaDetailPage in src/pages/MediaDetailPage.tsx (position above EpisodeRatingsDisplay table)
- [x] T015 [US1] Pass episode data from MediaDetailPage to EpisodeChart in src/pages/MediaDetailPage.tsx (episodes={data.episodesBySeason[selectedSeason]})
- [x] T016 [US1] Add conditional rendering for TV series only in src/pages/MediaDetailPage.tsx (only show chart when mediaType === 'tv' and episodesBySeason exists)

**Checkpoint**: User Story 1 complete - Chart displays on TV series detail pages with TMDB and Trakt lines

---

## Phase 3: User Story 2 - Switch Between Seasons in Chart View (Priority: P2)

**Goal**: Chart updates when user selects a different season from the season selector

**Independent Test**: Navigate to Breaking Bad, click "Season 2" button, verify chart updates to show Season 2 episode ratings with smooth 300ms fade-in animation

### Implementation for User Story 2

- [x] T017 [US2] Add season change animation to EpisodeChart in src/components/media/EpisodeChart.tsx (add key={`chart-${seasonNumber}`} to force re-mount on season change)
- [x] T018 [US2] Verify chart responds to selectedSeason state changes in src/pages/MediaDetailPage.tsx (ensure episodes prop updates when season selector changes)
- [x] T019 [US2] Test season switching with manual verification (click through all seasons of Breaking Bad, verify chart updates correctly)

**Checkpoint**: User Story 2 complete - Chart smoothly updates when switching seasons

---

## Phase 4: User Story 3 - Handle Missing Episode Data Gracefully (Priority: P3)

**Goal**: Chart displays partial data and shows gaps when episodes lack ratings from one or both providers

**Independent Test**: Navigate to a TV series with incomplete Trakt data, verify TMDB line is complete and Trakt line shows gaps (no data points) where ratings are missing

### Implementation for User Story 3

- [x] T020 [P] [US3] Update custom tooltip to show "N/A" for missing ratings in src/components/media/EpisodeChart.tsx (check if value is null in tooltip)
- [x] T021 [P] [US3] Verify connectNulls={true} behavior in src/components/media/EpisodeChart.tsx (lines should connect across gaps, not break completely)
- [x] T022 [US3] Update transformEpisodesToChartData to preserve null values in src/lib/utils/chart-data.ts (do not filter out null scores, keep them as null)
- [x] T023 [US3] Add validation to prevent chart rendering when no episodes have any ratings in src/components/media/EpisodeChart.tsx (check chartData.length > 0)
- [x] T024 [US3] Test with real data: Find TV series with missing Trakt ratings and verify chart behavior

**Checkpoint**: User Story 3 complete - Chart handles missing data gracefully, shows gaps clearly

---

## Phase 5: Dark Mode Support & Polish

**Purpose**: Ensure chart adapts to dark mode and add visual polish

- [x] T025 [P] Add dark mode color detection in src/components/media/EpisodeChart.tsx (detect document.documentElement.classList.contains('dark'))
- [x] T026 [P] Create color state for dynamic theme switching in src/components/media/EpisodeChart.tsx (useState for tmdb, trakt, grid, text, background colors)
- [x] T027 [P] Implement MutationObserver for dark mode toggle in src/components/media/EpisodeChart.tsx (observe <html> classList changes)
- [x] T028 Apply dynamic colors to Line components in src/components/media/EpisodeChart.tsx (use state colors instead of hard-coded hex)
- [x] T029 Apply dynamic colors to XAxis, YAxis, CartesianGrid in src/components/media/EpisodeChart.tsx
- [x] T030 Update custom tooltip styling for dark mode in src/components/media/EpisodeChart.tsx (conditional Tailwind classes)
- [x] T031 Test dark mode toggle: Switch between light and dark mode, verify chart colors adapt correctly
- [x] T032 Test responsive design: Resize browser to 375px (mobile), 768px (tablet), 1024px (desktop), verify chart renders correctly
- [x] T033 Final integration test: Navigate to Breaking Bad, verify all features work (chart display, season switching, dark mode, missing data handling)

**Checkpoint**: All features complete and polished

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - MUST complete first (MVP)
- **User Story 2 (Phase 3)**: Depends on User Story 1 completion (builds on chart component)
- **User Story 3 (Phase 4)**: Can run in parallel with User Story 2 (independent feature)
- **Dark Mode & Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 (needs chart component to exist)
- **User Story 3 (P3)**: Technically independent, but more logical after US1 is complete

### Within Each User Story

**User Story 1 (foundational):**
- T004-T005 can run in parallel (skeleton + tooltip are separate files/components)
- T006-T013 are sequential (build chart step by step)
- T014-T016 are sequential (integration into existing page)

**User Story 2 (incremental):**
- T017-T019 are sequential (each builds on the previous)

**User Story 3 (polish):**
- T020-T021 can run in parallel (tooltip and line config are independent)
- T022-T024 are sequential (transformation → validation → testing)

**Dark Mode & Polish:**
- T025-T027 can run in parallel (color detection + state + observer are independent concerns)
- T028-T030 are sequential (apply colors systematically)
- T031-T033 are sequential manual tests

### Parallel Opportunities

**Setup Phase:**
- T002 and T003 can run in parallel (both are file creation tasks)

**User Story 1:**
- T004 and T005 can run in parallel (skeleton and tooltip)

**User Story 3:**
- T020 and T021 can run in parallel (tooltip and line config)

**Dark Mode:**
- T025, T026, T027 can run in parallel (detection, state, observer)

---

## Parallel Example: User Story 1 Foundation

```bash
# Launch skeleton and tooltip components together:
Task: "Create EpisodeChart component skeleton in src/components/media/EpisodeChart.tsx"
Task: "Create custom tooltip component in src/components/media/EpisodeChart.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: User Story 1 (T004-T016)
3. **STOP and VALIDATE**: Navigate to Breaking Bad, verify chart appears and displays correctly
4. Deploy/demo if ready

**Estimated time**: ~3-4 hours for complete MVP

### Incremental Delivery

1. Complete Setup → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 → Test season switching → Deploy/Demo
4. Add User Story 3 → Test missing data → Deploy/Demo
5. Add Dark Mode & Polish → Final release

**Total estimated time**: ~4-6 hours for complete feature

### Parallel Team Strategy

With multiple developers:

1. Developer A completes Setup (Phase 1)
2. Once Setup is done:
   - Developer A: User Story 1 core implementation (T004-T013)
   - Developer B: User Story 3 (T020-T024) - can work on tooltip/null handling in isolation
3. After US1 complete:
   - Developer A: User Story 2 (T017-T019)
   - Developer B: Dark Mode (T025-T030)
4. Both: Final testing (T031-T033)

---

## Task Summary

- **Total Tasks**: 33
- **Setup**: 3 tasks
- **User Story 1** (P1 - MVP): 13 tasks
- **User Story 2** (P2): 3 tasks
- **User Story 3** (P3): 5 tasks
- **Dark Mode & Polish**: 9 tasks

**Parallel Opportunities**: 8 tasks can run in parallel (marked with [P])

**Independent Test Criteria:**
- US1: Chart appears on TV series detail pages with two lines
- US2: Chart updates smoothly when switching seasons
- US3: Chart shows gaps for missing data without breaking

**MVP Scope**: Setup + User Story 1 = 16 tasks (estimated 3-4 hours)

---

## Notes

- [P] tasks = different files/components, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- NO backend changes required - Phase 1 API already provides all data
- NO new database schema - all data from external APIs (TMDB, Trakt)
- Chart is supplementary to table view (table remains as accessible alternative)
- Recharts v3.5.1+ has built-in TypeScript types (no @types package)
- Dark mode uses MutationObserver to detect <html> class changes
- Animation duration is exactly 300ms as specified
- Y-axis always shows 0-10 scale for consistency
- Chart height is fixed at 400px
- Mobile support: 375px+ width (ResponsiveContainer handles this automatically)
