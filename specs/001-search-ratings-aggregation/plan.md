# Implementation Plan: BingeScore Phase 1 - Search & Ratings Aggregation

**Branch**: `001-search-ratings-aggregation` | **Date**: 2025-12-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-search-ratings-aggregation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

BingeScore Phase 1 delivers an anonymous, stateless web application for searching TV series and movies, then viewing aggregated ratings from multiple sources (TMDB, OMDb/IMDb, and Trakt). Users can search via autocomplete (triggered after 2+ characters with 300ms debounce), select a title, and view overall ratings plus episode-by-episode ratings (for TV series) displayed as raw data in tabular format. The system operates without authentication or database persistence, with the backend serving as a real-time aggregator of external APIs.

## Technical Context

**Language/Version**: TypeScript with Node.js 18+ LTS (strict mode enabled)
**Primary Dependencies**:
- **Backend**: Fastify (HTTP server), Zod (validation), date-fns (date formatting)
- **Frontend**: React 18+, Vite (build tool), Tailwind CSS v4, Lucide icons, Framer Motion (animations), react-hot-toast (notifications), TanStack Query (data fetching)
- **External APIs**: TMDB (search, details, ratings), OMDb (IMDb ratings), Trakt (ratings, episode data)

**Storage**: None (Phase 1 is stateless - no database, no caching beyond in-memory)
**Testing**: Vitest (test runner), @testing-library/react (React component testing), Fastify .inject() for API testing
**Target Platform**: Web browsers (modern Chrome, Firefox, Safari, Edge) + Node.js server (Docker container)
**Project Type**: Full-stack web application (React SPA + Fastify API server)
**Performance Goals**:
- Search results appear within 2 seconds of user input (FR-002, SC-002)
- Aggregated ratings display within 5 seconds of selection (SC-003)
- Episode ratings for TV series display within 8 seconds (SC-004)
- Support reasonable concurrent usage (stateless architecture scales horizontally)

**Constraints**:
- No database persistence (stateless, ephemeral data only)
- No user authentication (anonymous access only)
- No server-side caching (every request fetches fresh data from external APIs)
- Must handle API rate limits gracefully with clear error messages (FR-016a)
- Must aggregate ratings from at least 2 out of 3 sources successfully 90% of the time (SC-006)

**Scale/Scope**:
- Phase 1 MVP with 3 prioritized user stories
- 2 API routes: GET /api/search, GET /api/media/aggregate
- 2 main pages: Home/Search, Media Detail
- 11 UI components specified
- ~20 functional requirements
- Focus on development velocity and learning (personal training project)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: TypeScript-First Development ✅ PASS
- All code will be TypeScript with `strict: true`
- No `any` types unless documented
- Shared types in `lib/types/`
- **Compliance**: Feature design uses TypeScript throughout, validates external API responses with Zod

### Principle II: Simplicity & No Over-Engineering ✅ PASS
- Single repo, single Fastify app, no database for Phase 1
- NO microservices, NO unnecessary frameworks
- Plain functions for domain logic
- **Compliance**: Phase 1 is intentionally minimal - stateless aggregation with no premature abstractions

### Principle III: Fastify Server Architecture ✅ PASS
- Backend MUST be Fastify (NOT Express, NOT serverless)
- Long-lived Node.js process in Docker container
- Route organization under `server/routes/`
- Plugin architecture for cross-cutting concerns
- **Compliance**: Feature specifies Fastify with 2 routes (`/api/search`, `/api/media/aggregate`), no serverless

### Principle IV: Pragmatic Testing Strategy ✅ PASS
- Test business logic (rating aggregation, episode merging)
- Test provider normalization utilities
- Use Vitest + @testing-library/react sparingly
- **Compliance**: Specification identifies aggregation logic and provider normalization as must-test areas

### Principle V: Dev/Prod Parity ✅ PASS
- Local dev uses Vite + Fastify
- Production uses Docker container
- Same Node.js version (defined in Dockerfile)
- **Compliance**: Phase 1 doesn't require database, so no dev/prod database parity concerns yet

### Technology Stack Compliance ✅ PASS
**Locked-In Choices**:
- ✅ React 18+ (function components + hooks)
- ✅ TypeScript strict mode
- ✅ Vite build tool
- ✅ Tailwind CSS v4
- ✅ Fastify (NOT Express, NOT NestJS)
- ✅ NO Next.js, NO serverless
- ✅ Vitest for testing

**Supporting Libraries** (from specification):
- ✅ Framer Motion (animations - optional, non-blocking)
- ✅ Zod (runtime validation)
- ✅ react-hot-toast (user feedback)
- ✅ date-fns (date/time formatting)

### Architecture Compliance ✅ PASS
- Three-layer architecture: Frontend (React) → Backend (Fastify) → Domain/Data (lib/)
- Routes handle HTTP only, domain logic in `lib/domain/`, no database layer needed for Phase 1
- Separation of concerns maintained

### Violations: NONE

**Gate Status**: ✅ **PASSED** - Proceed to Phase 0 (Research)

## Project Structure

### Documentation (this feature)

```text
specs/001-search-ratings-aggregation/
├── spec.md              # Feature specification (completed)
├── checklists/
│   └── requirements.md  # Specification validation checklist (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (API integration patterns, best practices)
├── data-model.md        # Phase 1 output (domain types, entities)
├── quickstart.md        # Phase 1 output (developer onboarding)
├── contracts/           # Phase 1 output (API OpenAPI specs)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
binge-ratings/
├── src/                        # Frontend (React + Vite)
│   ├── components/             # React components
│   │   ├── search/             # Search-related components
│   │   │   ├── SearchBar.tsx
│   │   │   ├── AutocompleteResults.tsx
│   │   │   └── SearchResultItem.tsx
│   │   ├── media/              # Media detail components
│   │   │   ├── MediaDetailHeader.tsx
│   │   │   ├── OverallRatingsPanel.tsx
│   │   │   ├── RatingCard.tsx
│   │   │   ├── SeasonSelector.tsx
│   │   │   └── EpisodeRatingsDisplay.tsx
│   │   └── layout/             # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── pages/                  # Page-level components (routes)
│   │   ├── SearchPage.tsx
│   │   └── MediaDetailPage.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSearch.ts
│   │   └── useMediaAggregation.ts
│   ├── lib/                    # Frontend-only utilities
│   │   └── api-client.ts       # API client helpers
│   ├── styles/                 # Global styles, Tailwind config
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── server/                     # Backend (Fastify server)
│   ├── index.ts                # Server entrypoint
│   ├── app.ts                  # Fastify app setup
│   ├── routes/                 # Route handlers
│   │   ├── search.ts           # GET /api/search
│   │   └── media.ts            # GET /api/media/aggregate
│   ├── plugins/                # Fastify plugins
│   │   ├── cors.ts             # CORS configuration
│   │   └── error-handler.ts   # Centralized error handling
│   └── providers/              # External API providers
│       ├── tmdb.ts             # TMDB API client
│       ├── omdb.ts             # OMDb API client
│       └── trakt.ts            # Trakt API client
│
├── lib/                        # Shared code (frontend + backend)
│   ├── domain/                 # Business logic (pure functions)
│   │   ├── aggregation.ts      # Rating aggregation logic
│   │   └── episode-merge.ts    # Episode ratings merging (TMDB + Trakt)
│   ├── types/                  # Shared TypeScript types
│   │   ├── api.ts              # API request/response types
│   │   ├── domain.ts           # Domain entity types
│   │   └── providers.ts        # Provider-specific types
│   └── utils/                  # Shared utilities
│       ├── validation.ts       # Zod schemas
│       └── format.ts           # Date/time formatters
│
├── tests/                      # Tests (colocated with source when possible)
│   ├── domain/                 # Domain logic tests
│   │   ├── aggregation.test.ts
│   │   └── episode-merge.test.ts
│   └── integration/            # API integration tests (Fastify .inject())
│       └── search.test.ts
│
├── .env.example                # Example environment variables
├── .env                        # Local environment variables (git-ignored)
├── .nvmrc                      # Node.js version (18+)
├── tsconfig.json               # Root TypeScript config
├── tsconfig.node.json          # Node/Server TypeScript config
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
└── package.json
```

**Structure Decision**: Web application (Option 2) with full-stack layout. Frontend in `src/`, backend in `server/`, shared code in `lib/`. Phase 1 does not require Docker setup yet (no database dependency), but structure prepares for future Docker integration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** Constitution Check passed with full compliance.

---

## Milestones

### Milestone 1: Project Foundation & Setup ✅
**Goal**: Establish project structure, install dependencies, configure tooling

**Deliverables**:
- Project scaffolded with Vite + Fastify
- TypeScript configured with strict mode
- Dependencies installed (React, Fastify, Zod, TanStack Query, Tailwind, etc.)
- Environment variables template (`.env.example`)
- Basic folder structure matching `Project Structure` section
- Health check endpoint functional

**Completion Criteria**: `curl http://localhost:4000/health` returns `{"status":"ok"}`

**Estimated Effort**: 2-3 hours

---

### Milestone 2: Backend API - Search Endpoint
**Goal**: Implement TMDB search integration

**Deliverables**:
- `server/providers/tmdb.ts` with `searchMulti()` implementation
- `server/routes/search.ts` with `/api/search` endpoint
- Zod schema validation for TMDB responses
- Error handling for TMDB API failures
- CORS plugin configured
- Search endpoint returns normalized `SearchResult[]`

**Completion Criteria**: `curl "http://localhost:4000/api/search?q=breaking%20bad"` returns array of search results

**Estimated Effort**: 3-4 hours

---

### Milestone 3: Backend API - Aggregation Endpoint (Part 1: TMDB + OMDb)
**Goal**: Implement rating aggregation from TMDB and OMDb

**Deliverables**:
- `server/providers/omdb.ts` with IMDb rating fetching
- `server/routes/media.ts` with `/api/media/aggregate` endpoint (TMDB + OMDb only)
- `lib/domain/aggregation.ts` with parallel fetching logic (Promise.allSettled)
- TMDB external IDs resolution (get IMDb ID)
- Graceful degradation when OMDb fails

**Completion Criteria**: Aggregate endpoint returns overall ratings from TMDB and OMDb (Trakt pending)

**Estimated Effort**: 4-5 hours

---

### Milestone 4: Backend API - Trakt Integration & Episode Ratings
**Goal**: Complete aggregation with Trakt, add episode ratings

**Deliverables**:
- `server/providers/trakt.ts` with Trakt ID resolution and rating fetching
- Episode ratings fetching from TMDB and Trakt
- `lib/domain/episode-merge.ts` with episode merging logic
- Complete `/api/media/aggregate` endpoint with all 3 providers
- Episode ratings organized by season for TV series

**Completion Criteria**: Aggregate endpoint returns ratings from all 3 sources + episode data for TV shows

**Estimated Effort**: 4-5 hours

---

### Milestone 5: Frontend - Search Flow
**Goal**: Implement search page with autocomplete

**Deliverables**:
- `src/components/layout/Header.tsx` and `Footer.tsx`
- `src/components/search/SearchBar.tsx` with debounced input
- `src/components/search/AutocompleteResults.tsx` with floating panel
- `src/components/search/SearchResultItem.tsx`
- `src/hooks/useSearch.ts` with TanStack Query
- `src/hooks/useDebounce.ts` custom hook (300ms)
- `src/pages/SearchPage.tsx`
- Loading states, error handling with react-hot-toast

**Completion Criteria**: User can type query, see autocomplete results after 300ms, click a result to navigate

**Estimated Effort**: 5-6 hours

---

### Milestone 6: Frontend - Media Detail Page
**Goal**: Display aggregated ratings and episode data

**Deliverables**:
- `src/components/media/MediaDetailHeader.tsx` (poster, title, overview)
- `src/components/media/OverallRatingsPanel.tsx`
- `src/components/media/RatingCard.tsx` (individual source ratings)
- `src/components/media/SeasonSelector.tsx` (horizontal pills for TV series)
- `src/components/media/EpisodeRatingsDisplay.tsx` (raw data table/list)
- `src/hooks/useMediaAggregation.ts` with TanStack Query
- `src/pages/MediaDetailPage.tsx`
- Responsive layouts (mobile single-column, desktop two-column)
- Framer Motion animations (hover, transitions)

**Completion Criteria**: User can view full detail page with all ratings, episode data for TV series displayed as table

**Estimated Effort**: 6-7 hours

---

### Milestone 7: Styling & UI Polish
**Goal**: Apply design system, ensure light/dark mode, accessibility

**Deliverables**:
- Tailwind CSS v4 configuration
- Light/dark mode support with semantic colors
- Lucide icons integrated throughout
- Hover states, focus states for accessibility
- Responsive design tested on mobile and desktop
- Consistent spacing, typography, shadows

**Completion Criteria**: Application matches UI specification (spec.md UI section), passes visual review in both modes

**Estimated Effort**: 3-4 hours

---

### Milestone 8: Testing & Error Handling
**Goal**: Write tests for critical logic, ensure robust error handling

**Deliverables**:
- `tests/domain/aggregation.test.ts` (rating aggregation logic)
- `tests/domain/episode-merge.test.ts` (episode merging logic)
- `tests/integration/search.test.ts` (Fastify .inject() test)
- Provider normalization tests
- Error toast notifications for rate limits, API failures
- Graceful degradation tested (partial provider failures)

**Completion Criteria**: All tests pass, error scenarios handled gracefully with user-friendly messages

**Estimated Effort**: 4-5 hours

---

### Milestone 9: Final Integration & Documentation
**Goal**: End-to-end testing, polish, documentation

**Deliverables**:
- Full user flow tested (search → select → view ratings)
- Performance validated against success criteria (SC-002, SC-003, SC-004)
- README updated with setup instructions
- Environment variables documented
- API documentation reviewed (OpenAPI spec)

**Completion Criteria**: All functional requirements (FR-001 to FR-020) verified, all success criteria met

**Estimated Effort**: 2-3 hours

---

**Total Estimated Effort**: 33-42 hours

---

## Dependencies & Critical Path

### Critical Path
```
Phase 0 (Setup)
  ↓
Phase 1 (Search Endpoint) → Phase 2 (Aggregation Part 1) → Phase 3 (Trakt + Episodes)
  ↓                                                              ↓
Phase 4 (Frontend Search) ----------------------------------------→ Phase 5 (Frontend Detail)
  ↓                                                              ↓
Phase 6 (Styling & Polish) ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
  ↓
Phase 7 (Testing) → Phase 8 (Final Integration)
```

### Detailed Dependencies

- **Milestone 2 depends on Milestone 1**: Cannot implement routes without project setup
- **Milestone 3 depends on Milestone 2**: Aggregation route uses TMDB provider from Milestone 2
- **Milestone 4 depends on Milestone 3**: Trakt integration builds on aggregation logic
- **Milestone 5 depends on Milestone 2**: Frontend search calls backend search endpoint
- **Milestone 6 depends on Milestone 4**: Frontend detail page calls complete aggregation endpoint
- **Milestone 7 can run in parallel with Milestone 8**: Styling and testing are independent
- **Milestone 9 depends on all previous milestones**: Final integration requires everything complete

### Parallel Work Opportunities

- **Milestone 2 and Milestone 5 can partially overlap**: Once search endpoint is done, frontend search can start
- **Milestone 3 and Milestone 4 backend work**: Can work on OMDb and Trakt in parallel (separate providers)
- **Milestone 7 (styling) and Milestone 8 (testing)**: Can be done simultaneously

---

## Risk Areas & Considerations

### 1. External API Rate Limits

**Risk**: TMDB, OMDb, or Trakt may impose rate limits

**Mitigation**:
- Use generous rate limits in Phase 1 (TMDB: 40 req/10s, OMDb: 1,000/day, Trakt: 1,000/5min)
- Implement graceful degradation (FR-016a: display error, allow retry)
- Monitor API usage during testing
- Consider caching in future phases to reduce API calls

**Impact**: Medium - Can block development if hit during testing

---

### 2. API Response Inconsistencies

**Risk**: TMDB, OMDb, Trakt may return unexpected response formats or missing data

**Mitigation**:
- Use Zod for runtime validation of all API responses
- Fail fast with clear error messages
- Handle null/undefined gracefully in domain logic
- Write tests for edge cases (missing IMDb ID, no episode ratings, etc.)

**Impact**: High - Could cause runtime crashes if not validated

---

### 3. CORS Configuration Issues

**Risk**: Frontend may fail to call backend due to CORS errors

**Mitigation**:
- Configure CORS early (Milestone 1)
- Test API calls from frontend as soon as backend is ready
- Use environment variable for CORS_ORIGIN to support different environments

**Impact**: Low - Easy to fix once identified

---

### 4. Performance Not Meeting Success Criteria

**Risk**: API calls may take longer than specified (SC-002: <2s, SC-003: <5s, SC-004: <8s)

**Mitigation**:
- Use parallel fetching with Promise.allSettled (research decision)
- Test with real API calls during development
- Use browser DevTools Network tab to measure latency
- If performance issues arise, consider adding caching (deferred to Phase 2+)

**Impact**: Medium - Success criteria are generous, but slow APIs could cause issues

---

### 5. Episode Rating Data Quality

**Risk**: TMDB or Trakt may have incomplete episode data (missing episodes, mismatched season numbers)

**Mitigation**:
- Episode merge logic handles missing data (display "N/A" for null scores)
- Test with multiple TV series (popular and obscure)
- Document known limitations in user-facing messages

**Impact**: Low - Graceful degradation strategy mitigates

---

### 6. TypeScript Configuration Complexity

**Risk**: Path aliases, multiple tsconfig files may cause import issues

**Mitigation**:
- Set up path aliases early (Milestone 1)
- Test imports across all layers (frontend, backend, shared lib)
- Use absolute imports consistently

**Impact**: Low - Once configured correctly, should be stable

---

### 7. Dark Mode Implementation Complexity

**Risk**: Tailwind dark mode may require refactoring all components

**Mitigation**:
- Use Tailwind dark mode from the start (Milestone 7)
- Use semantic color classes (e.g., `bg-gray-100 dark:bg-gray-900`)
- Test both modes frequently

**Impact**: Medium - Requires discipline to maintain throughout development

---

### 8. Testing Time Investment

**Risk**: Writing comprehensive tests may consume more time than estimated

**Mitigation**:
- Follow pragmatic testing strategy from constitution (Principle IV)
- Focus on business logic tests only (aggregation, episode merge)
- Skip UI snapshot tests in Phase 1
- Keep tests simple and fast

**Impact**: Low - Pragmatic approach limits scope

---

## Post-Phase 1 Considerations

### Phase 2 Features (Not in Current Plan)

- **Database**: PostgreSQL + Drizzle ORM
  - Cache aggregated ratings to reduce API calls
  - Store user watchlist and favorites
  - Track search history

- **Authentication**: JWT in HTTP-only cookies
  - User registration and login
  - Protected routes for favorites/watchlist

- **Recommendations**: Algorithm to suggest similar titles
  - Based on viewing history
  - Based on ratings patterns

- **Advanced Search**: Filters by genre, year, rating range
  - Pagination for search results

### Technical Debt to Address Later

- **Caching Strategy**: Add Redis or in-memory cache for API responses
- **Logging**: Integrate external logging service (Sentry, LogRocket)
- **Monitoring**: Add APM for performance tracking
- **E2E Tests**: Add Playwright tests for critical user flows
- **Docker Setup**: Create Dockerfile and docker-compose for full-stack deployment

---

**Planning Complete**: All milestones, dependencies, and risks documented. Ready to proceed to `/speckit.tasks` for detailed task generation.
