# BingeScore - TV & Movie Ratings Aggregator

A full-stack TypeScript web application that searches for movies and TV series, aggregating ratings from multiple sources (TMDB, OMDb/IMDb, and Trakt) with beautiful episode-level visualizations.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v4 + TanStack Query + Recharts + Framer Motion
- **Backend**: Fastify + TypeScript
- **Typography**: Geist Font (self-hosted)
- **Testing**: Vitest + React Testing Library
- **External APIs**: TMDB, OMDb, Trakt

## Prerequisites

- Node.js 18+ (check with `node --version`)
- npm or yarn
- API keys from TMDB, OMDb, and Trakt

## Getting API Keys

### TMDB API Key

1. Create account at https://www.themoviedb.org/
2. Go to Settings → API → Request API Key
3. Choose "Developer" option and fill out form
4. Copy your **API Key (v3 auth)**

### OMDb API Key

1. Go to https://www.omdbapi.com/apikey.aspx
2. Select "FREE! (1,000 daily limit)"
3. Enter your email and activate via email link

### Trakt Client ID

1. Create account at https://trakt.tv/
2. Go to Settings → Your API Apps → New Application
3. Fill out form with redirect URI: `urn:ietf:wg:oauth:2.0:oob`
4. Copy your **Client ID**

## Setup

1. **Clone and install dependencies**:

```bash
git clone <repo-url>
cd BingScore2026
npm install
```

2. **Configure environment variables**:

```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Start development servers**:

Terminal 1 (Frontend):

```bash
npm run dev
```

Terminal 2 (Backend):

```bash
npm run server:dev
```

4. **Verify setup**:

- Backend: http://localhost:4000/health should return `{"status":"ok"}`
- Frontend: http://localhost:5173

## Available Scripts

- `npm run dev` - Start Vite frontend dev server (http://localhost:5173)
- `npm run server:dev` - Start Fastify backend dev server (http://localhost:4000)
- `npm test` - Run test suite (29 tests)
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types
- `npm run build` - Build production bundle
- `npm run vercel-build` - Build for Vercel deployment

## Deployment

### Deploy to Vercel

This app is configured for serverless deployment on Vercel. See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

**Quick Deploy**:

```bash
npm install -g vercel
vercel login
vercel link
vercel env add TMDB_API_KEY production
vercel env add OMDB_API_KEY production
vercel env add TRAKT_CLIENT_ID production
vercel --prod
```

The app will be deployed with:
- Frontend: Static React app
- Backend: 3 serverless functions (`/api/health`, `/api/search`, `/api/media/aggregate`)
- All on Vercel's free tier

## Project Structure

```
├── src/                 # Frontend (React + Vite)
│   ├── components/      # React components
│   ├── pages/           # Page-level components
│   ├── hooks/           # Custom React hooks
│   └── styles/          # Global styles
├── server/              # Backend (Fastify - dev mode)
│   ├── routes/          # API route handlers
│   ├── plugins/         # Fastify plugins
│   └── providers/       # External API clients
├── api/                 # Serverless functions (Vercel)
│   ├── health.ts        # Health check endpoint
│   ├── search.ts        # Search endpoint
│   └── media/           # Media endpoints
│       └── aggregate.ts # Ratings aggregation
├── lib/                 # Shared code
│   ├── domain/          # Business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Shared utilities
└── tests/               # Tests
```

## Features

### Phase 1: Search & Ratings Aggregation ✅

- ✅ **Smart Search**: Autocomplete with 300ms debounce
- ✅ **Multi-Source Ratings**: Aggregate data from TMDB, IMDb, and Trakt
- ✅ **Episode Ratings Table**: View ratings for all episodes with season selector
- ✅ **Dark Mode**: System-aware theme toggle with localStorage persistence
- ✅ **Responsive Design**: Mobile-first, works on all devices
- ✅ **Smooth Animations**: Framer Motion for delightful UX
- ✅ **Error Handling**: Graceful fallbacks and loading states

### Phase 2: Episode Rating Charts ✅

- ✅ **Interactive Charts**: Line charts with TMDB (blue) and Trakt (red) ratings
- ✅ **Season Switching**: Smooth transitions between seasons with animations
- ✅ **Season Averages**: Calculated averages displayed for quick quality assessment
- ✅ **Episode Tooltips**: Hover to see episode number, title, and both ratings
- ✅ **Missing Data Handling**: Graceful gaps for episodes without ratings
- ✅ **Dark Mode Charts**: Automatic color adaptation for light/dark themes
- ✅ **Season-Relative X-Axis**: Episodes always numbered 1, 2, 3... per season
- ✅ **Compact Table View**: Lightweight episode table below chart

### Design & UX

- ✅ **Geist Font**: Self-hosted Vercel Geist Sans & Mono fonts
- ✅ **Custom Color Palette**: Dust Gray, Ivory, Tuscan Sun, Shadow Gray, Grafite
- ✅ **High Contrast**: WCAG-compliant contrast ratios in light mode
- ✅ **GitHub Integration**: Header link to project repository

### Testing

- ✅ **Comprehensive Test Suite**: 29 tests covering critical functionality
  - Chart data transformation utilities
  - SearchBar user interactions
  - AutocompleteResults rendering
  - useDebounce hook timing behavior

## Documentation

### Phase 1
- [Specification](specs/001-search-ratings-aggregation/spec.md)
- [Quickstart Guide](specs/001-search-ratings-aggregation/quickstart.md)
- [Implementation Plan](specs/001-search-ratings-aggregation/plan.md)
- [Data Model](specs/001-search-ratings-aggregation/data-model.md)

### Phase 2
- [Specification](specs/002-episode-charts/spec.md)
- [Implementation Plan](specs/002-episode-charts/plan.md)
- [Task List](specs/002-episode-charts/tasks.md)

## License

MIT
