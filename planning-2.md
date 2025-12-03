You are entering the PLANNING phase for **BingeScore – Phase 2 (Episode Rating Charts)**.

Do NOT rewrite or modify:

- the Constitution,
- the Phase 1 Specification,
- any Phase 1 behavior or architecture.

Phase 2 ONLY extends the existing system by introducing episode-level rating charts for TV shows.

Use the existing documents as context and produce a concrete, actionable, incremental **development plan**.

Your output must include:

---

## 1. Scope of Phase 2

Describe in 3–6 bullet points what Phase 2 adds on top of Phase 1:

- episode-level rating aggregation,
- season selector UI,
- episode line chart with TMDB and Trakt ratings,
- backend changes to fetch per-episode data,
- data transformation for charts,
- UI presentation using Recharts,
- loading/error/empty states.

---

## 2. Task Breakdown

Produce a clear list of tasks, all:

- small,
- implementable,
- testable,
- ordered logically.

Tasks MUST cover:

### Backend

- Add new Fastify provider functions:
  - TMDB: fetch episode list per season, extract vote_average per episode.
  - Trakt: fetch episode rating per season/episode.
- Merge TMDB + Trakt into unified `EpisodeRatingEntry`.
- Extend `AggregatedRatings` to include `episodesBySeason`.
- Add transformation logic to normalize episode numbering, missing values, season skipping, etc.
- Validate provider responses with Zod schemas.
- Expose episode data via `/api/media/aggregate`.

### Frontend

- Install and configure **Recharts**.
- Add `EpisodeRatingsChart` component:
  - responsive layout,
  - two series (TMDB + Trakt),
  - tooltip, legend, grid.
- Add `SeasonEpisodesSection` with season selector + chart, using the new data.
- Create helper to transform `EpisodeRatingEntry[]` → `EpisodeChartPoint[]`.
- Integrate chart into `MediaDetailPage`.
- Add loading/error/empty states.
- Optional: micro animations for mounting/unmounting (Framer Motion).

---

## 3. Dependencies

List the dependencies between tasks, e.g.:

- frontend chart work depends on backend episode data being defined,
- episode merging depends on TMDB + Trakt provider availability,
- transformation helpers depend on merged data shape, etc.

---

## 4. Milestones

Define 3–6 milestone steps such as:

### Milestone 1 – Backend foundation

TMDB + Trakt episode endpoints integrated and validated with Zod.

### Milestone 2 – Aggregation logic complete

`episodesBySeason` returned with real data.

### Milestone 3 – Frontend chart implementation

Chart component implemented using mock data.

### Milestone 4 – End-to-end integration

Real data displayed in UI, season selector functional.

### Milestone 5 – UX polish & stability

States, transitions, skeletons, error handling.

---

## 5. Deliverables

Define what is considered “done” for Phase 2.

---

## IMPORTANT RULES

- Do NOT generate or propose code samples.
- Do NOT redesign or alter Phase 1 behavior.
- Only produce the **planning document** in Markdown.
