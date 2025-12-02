# Quickstart Guide: BingeScore Phase 1

**Feature**: 001-search-ratings-aggregation
**Purpose**: Get developers onboarded and running BingeScore Phase 1 locally
**Target Audience**: Developers joining the project or returning after time away

---

## Overview

BingeScore Phase 1 is a full-stack TypeScript web application that searches for movies/TV series and aggregates ratings from multiple sources (TMDB, OMDb, Trakt). This quickstart guide will get you running locally in under 10 minutes.

**Tech Stack**:

- **Frontend**: React 18 + Vite + Tailwind CSS v4 + TanStack Query
- **Backend**: Fastify + TypeScript
- **External APIs**: TMDB, OMDb, Trakt

**Prerequisites**:

- Node.js 18+ (check with `node --version`)
- npm or yarn
- Text editor (VS Code recommended)
- API keys (see Setup section)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd binge-ratings

# Install dependencies
npm install
```

**Estimated time**: 2-3 minutes

---

## 2. Get API Keys

You'll need API keys from three external services:

### TMDB API Key

1. Create account at https://www.themoviedb.org/
2. Go to Settings → API → Request API Key
3. Choose "Developer" option
4. Fill out form (use "Personal/Educational" purpose)
5. Copy your **API Key (v3 auth)**

### OMDb API Key

1. Go to https://www.omdbapi.com/apikey.aspx
2. Select "FREE! (1,000 daily limit)"
3. Enter your email
4. Check your email for the API key
5. Activate the key by clicking the link in the email

### Trakt Client ID

1. Create account at https://trakt.tv/
2. Go to Settings → Your API Apps → New Application
3. Fill out form:
   - Name: "BingeScore Local Dev"
   - Redirect URI: `urn:ietf:wg:oauth:2.0:oob` (not used in Phase 1)
   - Permissions: Leave default
4. Copy your **Client ID**

**Estimated time**: 10 minutes (including email verification)

---

## 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

**.env file contents**:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# External API Keys
TMDB_API_KEY=your_tmdb_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
TRAKT_CLIENT_ID=your_trakt_client_id_here

# CORS (for local development)
CORS_ORIGIN=http://localhost:5173
```

**Replace placeholders** with your actual API keys from Step 2.

**Estimated time**: 2 minutes

---

## 4. Start Development Servers

Open **two terminal windows** (or use tmux/screen):

**Terminal 1 - Frontend (Vite)**:

```bash
npm run dev
```

- Starts Vite dev server on http://localhost:5173
- Hot module replacement enabled
- Frontend will auto-reload on file changes

**Terminal 2 - Backend (Fastify)**:

```bash
npm run server:dev
```

- Starts Fastify server on http://localhost:4000
- Auto-restarts on file changes (using `tsx watch`)
- API endpoints available at `/api/*`

**Estimated time**: 1 minute

---

## 5. Verify Setup

### Backend Health Check

Open http://localhost:4000/health in your browser or run:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{ "status": "ok" }
```

### Frontend Access

Open http://localhost:5173 in your browser.
You should see the BingeScore homepage with a search bar.

### Test Search

1. Type "breaking bad" in the search box
2. Wait 300ms (debounce delay)
3. Autocomplete results should appear
4. Click on a result
5. Media detail page should load with aggregated ratings

**If you see ratings from TMDB, IMDb, and Trakt → ✅ Setup complete!**

**Estimated time**: 2 minutes

---

## 6. Project Structure Overview

```
binge-ratings/
├── src/                 # Frontend (React + Vite)
│   ├── components/      # React components
│   │   ├── search/      # SearchBar, AutocompleteResults, SearchResultItem
│   │   ├── media/       # MediaDetailHeader, RatingCard, EpisodeRatingsDisplay
│   │   └── layout/      # Header, Footer
│   ├── pages/           # SearchPage, MediaDetailPage
│   ├── hooks/           # useSearch, useMediaAggregation (TanStack Query)
│   └── lib/             # api-client helpers
│
├── server/              # Backend (Fastify)
│   ├── index.ts         # Server entrypoint
│   ├── app.ts           # Fastify app setup
│   ├── routes/          # search.ts, media.ts (API routes)
│   ├── plugins/         # cors.ts, error-handler.ts
│   └── providers/       # tmdb.ts, omdb.ts, trakt.ts (API clients)
│
├── lib/                 # Shared code (frontend + backend)
│   ├── domain/          # Business logic (aggregation, episode-merge)
│   ├── types/           # TypeScript types (api.ts, domain.ts, providers.ts)
│   └── utils/           # validation.ts (Zod schemas), format.ts (date-fns)
│
└── tests/               # Tests
    ├── domain/          # Domain logic tests (aggregation, episode-merge)
    └── integration/     # API integration tests (Fastify .inject())
```

**Key Files to Know**:

- `server/routes/search.ts`: Handles `/api/search` endpoint
- `server/routes/media.ts`: Handles `/api/media/aggregate` endpoint
- `server/providers/tmdb.ts`: TMDB API integration
- `lib/domain/aggregation.ts`: Rating aggregation logic
- `src/pages/SearchPage.tsx`: Home page with search
- `src/pages/MediaDetailPage.tsx`: Detail page with ratings

---

## 7. Development Workflow

### Making Changes

**Frontend Changes** (React components, styles):

1. Edit files in `src/`
2. Save → Vite auto-reloads
3. Check browser for changes

**Backend Changes** (API routes, providers):

1. Edit files in `server/` or `lib/`
2. Save → Fastify restarts automatically
3. Test API with curl or frontend

**Shared Code Changes** (types, utilities):

1. Edit files in `lib/`
2. Both frontend and backend can import from `lib/`
3. Path alias: `@/lib/...`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test tests/domain/aggregation.test.ts
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

---

## 8. Common Tasks

### Add a New API Route

1. Create new file in `server/routes/` (e.g., `recommendations.ts`)
2. Define Fastify plugin with route handler
3. Register plugin in `server/app.ts`
4. Add types to `lib/types/api.ts`
5. Test with `fastify.inject()` in `tests/integration/`

**Example**:

```typescript
// server/routes/recommendations.ts
import { FastifyPluginAsync } from 'fastify';

const recommendationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/recommendations', async (request, reply) => {
    // Implementation
    return { recommendations: [] };
  });
};

export default recommendationsRoutes;
```

### Add a New React Component

1. Create component file in `src/components/<category>/` (e.g., `src/components/media/TrailerPlayer.tsx`)
2. Define component with TypeScript types
3. Import and use in page or parent component
4. Add styles with Tailwind classes

**Example**:

```typescript
// src/components/media/TrailerPlayer.tsx
interface TrailerPlayerProps {
  videoKey: string;
  title: string;
}

export default function TrailerPlayer({ videoKey, title }: TrailerPlayerProps) {
  return (
    <div className="aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoKey}`}
        title={title}
        className="w-full h-full"
        allowFullScreen
      />
    </div>
  );
}
```

### Debug API Calls

**Backend Logs** (Terminal 2):

- Fastify logs all requests with Pino logger
- Check for error stack traces

**Frontend Network Tab**:

- Open browser DevTools → Network tab
- Filter by "Fetch/XHR"
- Inspect request/response payloads

**Test API Directly**:

```bash
# Test search endpoint
curl "http://localhost:4000/api/search?q=breaking%20bad"

# Test aggregate endpoint
curl "http://localhost:4000/api/media/aggregate?tmdbId=1396&mediaType=tv"
```

---

## 9. Troubleshooting

### Problem: "Failed to fetch results from TMDB"

**Cause**: Invalid TMDB API key or rate limit exceeded

**Solution**:

1. Check `.env` file has correct `TMDB_API_KEY`
2. Verify API key works: `curl "https://api.themoviedb.org/3/search/multi?api_key=YOUR_KEY&query=test"`
3. If rate limited, wait 10 seconds and retry

### Problem: "Rate limit exceeded" from OMDb

**Cause**: OMDb free tier limit (1,000 requests/day)

**Solution**:

1. Use a different email to get a new free key
2. Or upgrade to paid tier
3. System will gracefully degrade and show TMDB + Trakt ratings only

### Problem: Frontend can't connect to backend (CORS error)

**Cause**: CORS not configured correctly

**Solution**:

1. Check `.env` file has `CORS_ORIGIN=http://localhost:5173`
2. Restart backend server (Terminal 2)
3. Clear browser cache and reload

### Problem: Backend server won't start (port in use)

**Cause**: Port 4000 already in use

**Solution**:

```bash
# Find process using port 4000
lsof -i :4000

# Kill the process (replace PID)
kill -9 <PID>

# Or change port in .env
PORT=4001
```

### Problem: TypeScript errors in editor

**Cause**: TypeScript server out of sync

**Solution** (VS Code):

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

---

## 10. Next Steps

### Learn the Codebase

1. Read [research.md](research.md) - API integration patterns and decisions
2. Read [data-model.md](data-model.md) - Domain entities and types
3. Review [contracts/openapi.yaml](contracts/openapi.yaml) - API specification

### Start Contributing

1. Pick a task from `tasks.md` (generated by `/speckit.tasks` command)
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make changes, test locally
4. Commit with conventional format: `feat: add trailer player component`
5. Push and create pull request

### Run Tests Before Committing

```bash
npm run typecheck  # Must pass
npm test           # Must pass
npm run lint       # Must pass
```

### Phase 2 Features (Future)

- User authentication (JWT in HTTP-only cookies)
- Database persistence (PostgreSQL + Drizzle ORM)
- Favorites and watchlist
- Recommendations engine
- Advanced search filters

---

## 11. Useful Commands Reference

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start Vite frontend dev server     |
| `npm run server:dev` | Start Fastify backend dev server   |
| `npm test`           | Run all tests                      |
| `npm run test:watch` | Run tests in watch mode            |
| `npm run lint`       | Lint code with ESLint              |
| `npm run format`     | Format code with Prettier          |
| `npm run typecheck`  | Check TypeScript types             |
| `npm run build`      | Build production bundle (frontend) |

---

## 12. Getting Help

- **Project Documentation**: `/specs/001-search-ratings-aggregation/`
- **Constitution**: `.specify/memory/constitution.md`
- **API Docs**: `contracts/openapi.yaml`
- **GitHub Issues**: [Report bugs or request features]
- **TMDB API Docs**: https://developers.themoviedb.org/3
- **OMDb API Docs**: https://www.omdbapi.com/
- **Trakt API Docs**: https://trakt.docs.apiary.io/

---

**Quickstart Complete!** You should now have BingeScore Phase 1 running locally and understand the project structure. Happy coding! 🎬
