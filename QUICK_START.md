# BingeScore - Quick Start Guide

Get up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure API Keys

Edit the `.env` file and add your API keys:

```bash
TMDB_API_KEY=your_tmdb_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
TRAKT_CLIENT_ID=your_trakt_client_id_here
```

**Get your API keys:**
- TMDB: https://www.themoviedb.org/settings/api
- OMDb: https://www.omdbapi.com/apikey.aspx
- Trakt: https://trakt.tv/oauth/applications

## 3. Start the Servers

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 4. Open the App

Frontend: http://localhost:5173
Backend: http://localhost:4000

## 5. Try It Out!

1. Search for "Breaking Bad"
2. Click on a result
3. See ratings from TMDB, IMDb, and Trakt
4. For TV shows, view episode-by-episode ratings
5. Toggle dark mode with the moon/sun icon

## Troubleshooting

**"Unauthorized" error?**
- Check your API keys in `.env`
- Restart the backend server

**Can't connect to backend?**
- Make sure backend is running on port 4000
- Check CORS_ORIGIN in `.env` is set to `http://localhost:5173`

**No episode ratings?**
- Some shows may not have episode data on Trakt
- Episode ratings require successful Trakt ID resolution

## Useful Commands

```bash
npm test           # Run tests
npm run typecheck  # Check types
npm run lint       # Lint code
npm run format     # Format code
npm run build      # Build for production
```

## What You Can Do

✅ Search for movies and TV series
✅ View ratings from TMDB, IMDb, and Trakt
✅ See episode-by-episode ratings (TV shows)
✅ Navigate seasons with the selector
✅ Toggle between light and dark mode
✅ Enjoy smooth animations and responsive design

## Next Steps

- Read [README.md](README.md) for full documentation
- See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
- Check [specs/](specs/001-search-ratings-aggregation/) for feature specifications

Enjoy! 🎬
