# Tasks: BingeScore Phase 1 - Search & Ratings Aggregation

**Input**: Design documents from `/specs/001-search-ratings-aggregation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests for domain logic and provider normalization are required per constitution. UI tests are optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a full-stack web application:
- **Backend**: `server/` (Fastify)
- **Frontend**: `src/` (React + Vite)
- **Shared**: `lib/` (domain logic, types, utilities)
- **Tests**: `tests/` (domain and integration tests)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure with src/, server/, lib/, tests/ directories
- [ ] T002 Initialize Node.js project with package.json
- [ ] T003 [P] Install React dependencies (react, react-dom, react-router-dom)
- [ ] T004 [P] Install Vite and configure vite.config.ts
- [ ] T005 [P] Install Fastify dependencies (fastify, @fastify/cors)
- [ ] T006 [P] Install TanStack Query (@tanstack/react-query)
- [ ] T007 [P] Install Tailwind CSS v4 and configure tailwind.config.js
- [ ] T008 [P] Install Lucide icons (lucide-react)
- [ ] T009 [P] Install Framer Motion (framer-motion)
- [ ] T010 [P] Install react-hot-toast
- [ ] T011 [P] Install Zod (zod)
- [ ] T012 [P] Install date-fns
- [ ] T013 [P] Install dotenv for environment variables
- [ ] T014 [P] Install TypeScript and configure tsconfig.json with strict mode
- [ ] T015 [P] Create tsconfig.node.json for server code
- [ ] T016 [P] Install tsx for server development (tsx watch)
- [ ] T017 [P] Install Vitest and @testing-library/react
- [ ] T018 [P] Configure vitest.config.ts
- [ ] T019 [P] Install ESLint and Prettier
- [ ] T020 [P] Create .env.example with TMDB_API_KEY, OMDB_API_KEY, TRAKT_CLIENT_ID, PORT, CORS_ORIGIN
- [ ] T021 [P] Add .gitignore (node_modules, .env, dist)
- [ ] T022 [P] Create .nvmrc with Node.js 18
- [ ] T023 Configure package.json scripts (dev, server:dev, build, test, lint, format, typecheck)
- [ ] T024 [P] Create src/styles/globals.css with Tailwind directives
- [ ] T025 [P] Create server/index.ts with basic server entrypoint
- [ ] T026 [P] Create server/app.ts with Fastify app factory
- [ ] T027 Add health check endpoint GET /health in server/app.ts
- [ ] T028 Test server starts with npm run server:dev and health check returns {"status":"ok"}

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T029 Create lib/types/domain.ts with MediaType, SearchResult, UnifiedMediaId, OverallRating, EpisodeRatingEntry, AggregatedRatings interfaces
- [ ] T030 [P] Create lib/types/providers.ts with TMDB, OMDb, Trakt provider-specific types
- [ ] T031 [P] Create lib/types/api.ts with API request/response types (SearchQueryParams, AggregateQueryParams, ErrorResponse)
- [ ] T032 [P] Create lib/utils/validation.ts with Zod schemas (SearchResultSchema, OverallRatingSchema, etc.)
- [ ] T033 [P] Create lib/utils/format.ts with date formatting utilities using date-fns
- [ ] T034 Create server/plugins/cors.ts and configure CORS with origin from CORS_ORIGIN env variable
- [ ] T035 [P] Create server/plugins/error-handler.ts with centralized error handling
- [ ] T036 Register CORS and error handler plugins in server/app.ts
- [ ] T037 [P] Create src/components/layout/Header.tsx with logo and navigation links (Home, About, Placeholder)
- [ ] T038 [P] Create src/components/layout/Footer.tsx with minimal footer
- [ ] T039 [P] Create src/App.tsx with React Router setup (routes: /, /media/:mediaType/:tmdbId)
- [ ] T040 [P] Create src/main.tsx with React root, TanStack Query QueryClientProvider, react-hot-toast Toaster
- [ ] T041 Test frontend dev server starts with npm run dev and displays Header/Footer

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search for TV Series or Movie (Priority: P1) 🎯 MVP

**Goal**: Users can search for TV series or movies by typing in a search box, see autocomplete results, and select a specific title

**Independent Test**: Visit homepage, type "Breaking Bad" in search box, see autocomplete results appear after 300ms, click on a result to navigate to detail page

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T042 [P] [US1] Create tests/integration/search.test.ts with Fastify .inject() test for /api/search endpoint
- [ ] T043 [P] [US1] Create tests/domain/tmdb-normalization.test.ts to test TMDB response normalization to SearchResult[]

### Implementation for User Story 1

#### Backend - TMDB Provider

- [ ] T044 [P] [US1] Create server/providers/tmdb.ts with createTmdbProvider factory function
- [ ] T045 [US1] Implement searchMulti(query: string) method in server/providers/tmdb.ts
- [ ] T046 [US1] Add Zod validation for TMDB API responses in searchMulti
- [ ] T047 [US1] Normalize TMDB response to SearchResult[] (filter media_type, map fields, handle nulls)
- [ ] T048 [US1] Add error handling for TMDB API failures (network errors, invalid API key, rate limits)

#### Backend - Search Route

- [ ] T049 [US1] Create server/routes/search.ts with GET /api/search route handler
- [ ] T050 [US1] Validate query parameter 'q' (required, minimum 2 characters) in search route
- [ ] T051 [US1] Call tmdbProvider.searchMulti(query) and return SearchResult[] in search route
- [ ] T052 [US1] Handle errors in search route (400 for validation, 502 for TMDB failures)
- [ ] T053 [US1] Register search route in server/app.ts
- [ ] T054 [US1] Test search endpoint with curl "http://localhost:4000/api/search?q=breaking%20bad"

#### Frontend - Custom Hooks

- [ ] T055 [P] [US1] Create src/hooks/useDebounce.ts with custom debounce hook (300ms delay)
- [ ] T056 [P] [US1] Create src/hooks/useSearch.ts with TanStack Query useQuery hook for /api/search

#### Frontend - Search Components

- [ ] T057 [P] [US1] Create src/components/search/SearchBar.tsx with input field, Lucide Search icon, debounced onChange handler
- [ ] T058 [P] [US1] Create src/components/search/AutocompleteResults.tsx with floating panel, Framer Motion slide-down animation
- [ ] T059 [P] [US1] Create src/components/search/SearchResultItem.tsx with poster thumbnail, title, year, media type, hover state

#### Frontend - Search Page

- [ ] T060 [US1] Create src/pages/SearchPage.tsx rendering Header, SearchBar, AutocompleteResults, Footer
- [ ] T061 [US1] Connect useSearch hook to SearchBar and AutocompleteResults in SearchPage
- [ ] T062 [US1] Handle loading state (show Lucide Loader icon) in SearchBar
- [ ] T063 [US1] Handle error state with react-hot-toast notifications in SearchPage
- [ ] T064 [US1] Handle empty results state in AutocompleteResults
- [ ] T065 [US1] Implement navigation to /media/:mediaType/:tmdbId on SearchResultItem click
- [ ] T066 [US1] Test full search flow: type query, see results after 300ms, click result, verify navigation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Aggregated Overall Ratings (Priority: P2)

**Goal**: Users can see aggregated rating information from TMDB, OMDb/IMDb, and Trakt displayed together for a selected media item

**Independent Test**: Navigate directly to /media/tv/1396 (Breaking Bad) and verify ratings from TMDB, IMDb, and Trakt are all displayed

### Tests for User Story 2

- [ ] T067 [P] [US2] Create tests/domain/aggregation.test.ts to test rating aggregation logic (all 3 providers, partial failures)
- [ ] T068 [P] [US2] Create tests/integration/media-aggregate.test.ts with Fastify .inject() test for /api/media/aggregate endpoint

### Implementation for User Story 2

#### Backend - Provider Extensions (TMDB)

- [ ] T069 [P] [US2] Add getMediaDetails(tmdbId, mediaType) method to server/providers/tmdb.ts
- [ ] T070 [P] [US2] Add getExternalIds(tmdbId, mediaType) method to server/providers/tmdb.ts to fetch IMDb ID

#### Backend - OMDb Provider

- [ ] T071 [P] [US2] Create server/providers/omdb.ts with createOmdbProvider factory function
- [ ] T072 [US2] Implement getOverallRatingByImdbId(imdbId) method in server/providers/omdb.ts
- [ ] T073 [US2] Parse OMDb response (imdbRating string → number, imdbVotes remove commas)
- [ ] T074 [US2] Return OverallRating | null from OMDb provider
- [ ] T075 [US2] Handle errors gracefully (invalid IMDb ID, API failure returns null)

#### Backend - Trakt Provider (Part 1: Overall Ratings)

- [ ] T076 [P] [US2] Create server/providers/trakt.ts with createTraktProvider factory function
- [ ] T077 [US2] Implement resolveTraktId(tmdbId, mediaType) method in server/providers/trakt.ts
- [ ] T078 [US2] Fetch from Trakt search endpoint by TMDB ID and extract Trakt slug/ID
- [ ] T079 [US2] Implement getOverallRating(traktId, mediaType) method in server/providers/trakt.ts
- [ ] T080 [US2] Normalize Trakt rating to OverallRating format
- [ ] T081 [US2] Handle errors gracefully in Trakt provider

#### Backend - Aggregation Logic

- [ ] T082 [US2] Create lib/domain/aggregation.ts with aggregateRatings(tmdbId, mediaType) function
- [ ] T083 [US2] Fetch TMDB details and external IDs to build UnifiedMediaId in aggregateRatings
- [ ] T084 [US2] Fetch TMDB overall rating in aggregateRatings
- [ ] T085 [US2] Fetch OMDb rating (if IMDb ID available) in aggregateRatings
- [ ] T086 [US2] Fetch Trakt rating (resolve Trakt ID first) in aggregateRatings
- [ ] T087 [US2] Use Promise.allSettled for parallel fetching of all 3 providers
- [ ] T088 [US2] Handle partial failures gracefully (at least 2 out of 3 sources per SC-006)
- [ ] T089 [US2] Return AggregatedRatings with overall ratings (without episodes yet)

#### Backend - Media Aggregation Route

- [ ] T090 [US2] Create server/routes/media.ts with GET /api/media/aggregate route handler
- [ ] T091 [US2] Validate query parameters tmdbId (number) and mediaType (enum) in media route
- [ ] T092 [US2] Call aggregateRatings(tmdbId, mediaType) and return AggregatedRatings
- [ ] T093 [US2] Handle errors (400 for validation, 404 for not found, 429 for rate limits, 502 for API failures)
- [ ] T094 [US2] Register media route in server/app.ts
- [ ] T095 [US2] Test aggregate endpoint with curl "http://localhost:4000/api/media/aggregate?tmdbId=1396&mediaType=tv"

#### Frontend - Media Detail Hooks

- [ ] T096 [P] [US2] Create src/hooks/useMediaAggregation.ts with TanStack Query useQuery hook for /api/media/aggregate

#### Frontend - Rating Components

- [ ] T097 [P] [US2] Create src/components/media/MediaDetailHeader.tsx with poster, title, year, overview
- [ ] T098 [P] [US2] Create src/components/media/RatingCard.tsx accepting OverallRating prop, displaying source, score, votes
- [ ] T099 [P] [US2] Add Lucide Star icon to RatingCard, handle null rating (display "Not available")
- [ ] T100 [US2] Create src/components/media/OverallRatingsPanel.tsx rendering 3 RatingCards (TMDB, IMDb, Trakt)
- [ ] T101 [US2] Handle partial data in OverallRatingsPanel (some ratings null)

#### Frontend - Media Detail Page (Overall Ratings Only)

- [ ] T102 [US2] Create src/pages/MediaDetailPage.tsx with useParams to get tmdbId and mediaType
- [ ] T103 [US2] Call useMediaAggregation hook in MediaDetailPage
- [ ] T104 [US2] Render MediaDetailHeader and OverallRatingsPanel in MediaDetailPage
- [ ] T105 [US2] Handle loading state (skeleton or Lucide Loader spinner) in MediaDetailPage
- [ ] T106 [US2] Handle error state with react-hot-toast notifications in MediaDetailPage
- [ ] T107 [US2] Test media detail page: navigate to /media/tv/1396, verify all 3 ratings displayed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View Episode-by-Episode Ratings for TV Series (Priority: P3)

**Goal**: Users can see episode-by-episode ratings organized by season for TV series, allowing them to identify which seasons or episodes are highest rated

**Independent Test**: Navigate to any TV series detail page and verify episode ratings are displayed in a table organized by season

### Tests for User Story 3

- [ ] T108 [P] [US3] Create tests/domain/episode-merge.test.ts to test episode merging logic (TMDB + Trakt by season/episode number, missing episodes)

### Implementation for User Story 3

#### Backend - Provider Extensions for Episode Ratings

- [ ] T109 [P] [US3] Add getEpisodeRatings(tmdbId) method to server/providers/tmdb.ts
- [ ] T110 [US3] Fetch all seasons for TV series from TMDB in getEpisodeRatings
- [ ] T111 [US3] Extract episode ratings (season_number, episode_number, name, vote_average) from TMDB
- [ ] T112 [US3] Return EpisodeRatingEntry[] from TMDB provider

- [ ] T113 [P] [US3] Add getEpisodeRatings(traktId) method to server/providers/trakt.ts
- [ ] T114 [US3] Fetch seasons with episodes from Trakt API in getEpisodeRatings
- [ ] T115 [US3] Extract episode ratings (season, number, title, rating) from Trakt
- [ ] T116 [US3] Return EpisodeRatingEntry[] from Trakt provider

#### Backend - Episode Merge Logic

- [ ] T117 [US3] Create lib/domain/episode-merge.ts with mergeEpisodeRatings(tmdbEpisodes, traktEpisodes) function
- [ ] T118 [US3] Group episodes by season number in mergeEpisodeRatings
- [ ] T119 [US3] Match episodes by episode number within each season
- [ ] T120 [US3] Combine TMDB score and Trakt score side-by-side in EpisodeRatingEntry
- [ ] T121 [US3] Handle missing episodes (display as null for missing provider)
- [ ] T122 [US3] Handle episode count mismatch between providers
- [ ] T123 [US3] Return { [seasonNumber]: EpisodeRatingEntry[] } from mergeEpisodeRatings

#### Backend - Complete Aggregation with Episodes

- [ ] T124 [US3] Update lib/domain/aggregation.ts to fetch episode ratings for TV series
- [ ] T125 [US3] Call TMDB getEpisodeRatings and Trakt getEpisodeRatings for TV series
- [ ] T126 [US3] Merge episodes using mergeEpisodeRatings function
- [ ] T127 [US3] Add episodesBySeason to AggregatedRatings response for TV series
- [ ] T128 [US3] Test aggregate endpoint returns episode data for TV series

#### Frontend - Episode Components

- [ ] T129 [P] [US3] Create src/components/media/SeasonSelector.tsx with horizontal pill buttons for season navigation
- [ ] T130 [US3] Add useState to track selected season in SeasonSelector
- [ ] T131 [US3] Highlight active season pill in SeasonSelector

- [ ] T132 [P] [US3] Create src/components/media/EpisodeRatingsDisplay.tsx accepting episodesBySeason and selectedSeason props
- [ ] T133 [US3] Display table/list of episodes for selected season in EpisodeRatingsDisplay
- [ ] T134 [US3] Show columns: Episode #, Title, TMDB Score, Trakt Score in EpisodeRatingsDisplay
- [ ] T135 [US3] Handle missing scores (display "N/A" for null) in EpisodeRatingsDisplay

#### Frontend - Complete Media Detail Page

- [ ] T136 [US3] Update src/pages/MediaDetailPage.tsx to render SeasonSelector for TV series
- [ ] T137 [US3] Render EpisodeRatingsDisplay below OverallRatingsPanel for TV series
- [ ] T138 [US3] Pass episodesBySeason data from useMediaAggregation to SeasonSelector and EpisodeRatingsDisplay
- [ ] T139 [US3] Test TV series detail page: verify season selector works, episode table displays correctly

#### Responsive Layout

- [ ] T140 [US3] Implement desktop two-column layout (poster left, ratings right) in MediaDetailPage
- [ ] T141 [US3] Implement mobile single-column layout (stack vertically) in MediaDetailPage
- [ ] T142 [US3] Test responsive layouts on mobile and desktop screen sizes

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Styling & UI Polish

- [ ] T143 [P] Configure Tailwind CSS v4 with design system colors (neutral palette for light/dark mode)
- [ ] T144 [P] Implement light/dark mode toggle in Header component
- [ ] T145 [P] Ensure all components adapt to light/dark mode with semantic color classes
- [ ] T146 [P] Apply consistent spacing scale (Tailwind) across all components
- [ ] T147 [P] Apply consistent typography (font sizes, weights) across all components
- [ ] T148 [P] Apply consistent border radius (rounded-xl) to cards and panels
- [ ] T149 [P] Apply soft shadows to cards and floating panels
- [ ] T150 [P] Add Framer Motion hover animations to SearchResultItem (scale 1.02x)
- [ ] T151 [P] Add Framer Motion hover animations to RatingCard (scale 1.02x)
- [ ] T152 [P] Add Framer Motion page transition animations
- [ ] T153 [P] Ensure all Lucide icons are integrated consistently across app
- [ ] T154 Test visual appearance in both light and dark modes

### Accessibility

- [ ] T155 [P] Add visible focus states to all interactive elements (outline, ring)
- [ ] T156 [P] Test keyboard navigation (Tab, Enter) across all pages
- [ ] T157 [P] Ensure sufficient color contrast in both light and dark modes
- [ ] T158 [P] Add aria-labels to icon buttons and interactive elements
- [ ] T159 Test screen reader support with semantic HTML

### Error Handling & User Feedback

- [ ] T160 [P] Add react-hot-toast error notifications for TMDB API failures
- [ ] T161 [P] Add react-hot-toast error notification for rate limit exceeded (FR-016a)
- [ ] T162 [P] Add react-hot-toast error notification for provider unavailable
- [ ] T163 [P] Add react-hot-toast error notification for no search results
- [ ] T164 [P] Add react-hot-toast error notification for network timeout
- [ ] T165 Test error scenarios (rate limit, API failure, partial provider failures)

### Testing & Validation

- [ ] T166 Run all tests with npm test and ensure they pass
- [ ] T167 [P] Run typecheck with npm run typecheck and fix any TypeScript errors
- [ ] T168 [P] Run lint with npm run lint and fix any linting errors
- [ ] T169 [P] Run format with npm run format to ensure consistent code style
- [ ] T170 Validate end-to-end user flow 10 times (search → select → view ratings)
- [ ] T171 Measure search results latency (SC-002: <2 seconds)
- [ ] T172 Measure aggregated ratings latency (SC-003: <5 seconds)
- [ ] T173 Measure episode ratings latency (SC-004: <8 seconds)
- [ ] T174 Verify functional requirements FR-001 through FR-020 are implemented

### Documentation

- [ ] T175 [P] Create README.md with project description, setup instructions (link to quickstart.md)
- [ ] T176 [P] Document API key setup instructions in README
- [ ] T177 [P] Add development workflow documentation to README
- [ ] T178 [P] Review and update quickstart.md if needed
- [ ] T179 Run quickstart.md validation: follow steps and verify they work

### Code Cleanup

- [ ] T180 [P] Remove console.logs (except intentional server logs)
- [ ] T181 [P] Remove commented-out code
- [ ] T182 [P] Ensure no unused imports or variables
- [ ] T183 Run final format and lint pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Search)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅
- **User Story 2 (P2 - Overall Ratings)**: Can start after Foundational (Phase 2) - Builds on US1 search but detail page can be tested directly via URL ✅
- **User Story 3 (P3 - Episode Ratings)**: Can start after Foundational (Phase 2) - Extends US2 but independently testable ✅

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Backend providers before routes
- Backend routes before frontend hooks
- Frontend hooks before components
- Core components before page assembly
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T022)
- All Foundational tasks marked [P] can run in parallel (T029-T041)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each user story:
  - Tests marked [P] can run in parallel
  - Provider implementations marked [P] can run in parallel
  - Component implementations marked [P] can run in parallel
- Polish tasks marked [P] can run in parallel (T143-T183)

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task: "[US1] Create tests/integration/search.test.ts with Fastify .inject() test"
Task: "[US1] Create tests/domain/tmdb-normalization.test.ts"

# Launch backend provider and route setup in parallel (if different developers):
Task: "[US1] Create server/providers/tmdb.ts with createTmdbProvider factory"
# (then sequential: searchMulti implementation)

# Launch frontend hooks in parallel:
Task: "[US1] Create src/hooks/useDebounce.ts with custom debounce hook"
Task: "[US1] Create src/hooks/useSearch.ts with TanStack Query"

# Launch frontend components in parallel:
Task: "[US1] Create src/components/search/SearchBar.tsx"
Task: "[US1] Create src/components/search/AutocompleteResults.tsx"
Task: "[US1] Create src/components/search/SearchResultItem.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T028)
2. Complete Phase 2: Foundational (T029-T041) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T042-T066)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! ✅ Basic search works)
3. Add User Story 2 → Test independently → Deploy/Demo (✅ Ratings aggregation added)
4. Add User Story 3 → Test independently → Deploy/Demo (✅ Episode ratings added)
5. Polish phase → Final deployment

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T041)
2. Once Foundational is done:
   - Developer A: User Story 1 (T042-T066)
   - Developer B: User Story 2 (T067-T107) - Can start backend work immediately, frontend after US1 navigation is done
   - Developer C: User Story 3 (T108-T142) - Can start backend work immediately, frontend after US2 detail page is done
3. Stories complete and integrate independently
4. Team tackles Polish phase together (T143-T183)

---

## Task Summary

**Total Tasks**: 183

**By Phase**:
- Phase 1 (Setup): 28 tasks (T001-T028)
- Phase 2 (Foundational): 13 tasks (T029-T041)
- Phase 3 (User Story 1): 25 tasks (T042-T066)
- Phase 4 (User Story 2): 41 tasks (T067-T107)
- Phase 5 (User Story 3): 35 tasks (T108-T142)
- Phase 6 (Polish): 41 tasks (T143-T183)

**By User Story**:
- User Story 1 (Search): 25 tasks
- User Story 2 (Overall Ratings): 41 tasks
- User Story 3 (Episode Ratings): 35 tasks
- Shared/Infrastructure: 82 tasks

**Parallel Opportunities**: 87 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- ✅ US1: Type "Breaking Bad" → see results → click → navigate
- ✅ US2: Navigate to /media/tv/1396 → see 3 ratings displayed
- ✅ US3: Navigate to TV series → see season selector → see episode table

**Suggested MVP Scope**: Complete through User Story 1 (Phase 3) for basic working search

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests must fail before implementing (TDD approach for domain logic)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are explicit and match the project structure from plan.md
