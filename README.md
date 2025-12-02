# BingeScore Phase 1 - Search & Ratings Aggregation

A full-stack TypeScript web application that searches for movies and TV series, aggregating ratings from multiple sources (TMDB, OMDb/IMDb, and Trakt).

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v4 + TanStack Query
- **Backend**: Fastify + TypeScript
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

- `npm run dev` - Start Vite frontend dev server
- `npm run server:dev` - Start Fastify backend dev server
- `npm test` - Run all tests
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types
- `npm run build` - Build production bundle

## Project Structure

```
├── src/                 # Frontend (React + Vite)
│   ├── components/      # React components
│   ├── pages/           # Page-level components
│   ├── hooks/           # Custom React hooks
│   └── styles/          # Global styles
├── server/              # Backend (Fastify)
│   ├── routes/          # API route handlers
│   ├── plugins/         # Fastify plugins
│   └── providers/       # External API clients
├── lib/                 # Shared code
│   ├── domain/          # Business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Shared utilities
└── tests/               # Tests
```

## Features

### Phase 1 (Complete ✅)

- ✅ Search for TV series and movies with autocomplete (300ms debounce)
- ✅ View aggregated ratings from TMDB, IMDb, and Trakt
- ✅ Episode-by-episode ratings for TV series with season selector
- ✅ Dark mode support with toggle
- ✅ Responsive design (mobile and desktop)
- ✅ Beautiful UI with Framer Motion animations
- ✅ Graceful error handling and loading states

## Documentation

- Full documentation: [specs/001-search-ratings-aggregation/](specs/001-search-ratings-aggregation/)
- [Quickstart Guide](specs/001-search-ratings-aggregation/quickstart.md)
- [Implementation Plan](specs/001-search-ratings-aggregation/plan.md)
- [Data Model](specs/001-search-ratings-aggregation/data-model.md)

## License

MIT
