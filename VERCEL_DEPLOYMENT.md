# Vercel Deployment Guide for BingeScore

Your app is now ready for deployment to Vercel! All necessary files have been created.

## What Was Done

✅ Installed `@vercel/node` package for TypeScript types
✅ Created `vercel.json` configuration file
✅ Created 3 serverless API endpoints in `api/` directory:
- `api/health.ts` - Health check endpoint
- `api/search.ts` - Search endpoint
- `api/media/aggregate.ts` - Ratings aggregation endpoint

✅ Updated `package.json` with `vercel-build` script

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Your Project
```bash
vercel link
```
Follow the prompts to either:
- Link to an existing Vercel project, or
- Create a new project

### 4. Configure Environment Variables
Add your API keys to Vercel:

```bash
vercel env add TMDB_API_KEY production
# Paste your TMDB API key when prompted

vercel env add OMDB_API_KEY production
# Paste your OMDb API key when prompted

vercel env add TRAKT_CLIENT_ID production
# Paste your Trakt client ID when prompted
```

### 5. Deploy to Production
```bash
vercel --prod
```

That's it! Your app will be deployed to Vercel.

## Testing Your Deployment

Once deployed, Vercel will give you a URL like: `https://your-app.vercel.app`

Test these endpoints:

1. **Health Check**:
   `https://your-app.vercel.app/api/health`
   Should return: `{"status":"ok"}`

2. **Search**:
   `https://your-app.vercel.app/api/search?q=breaking bad`
   Should return search results

3. **Aggregation**:
   `https://your-app.vercel.app/api/media/aggregate?tmdbId=1396&mediaType=tv`
   Should return aggregated ratings for Breaking Bad

4. **Frontend**:
   `https://your-app.vercel.app/`
   Should load the full app with working search and charts

## Local Testing (Optional)

You can test the Vercel environment locally before deploying:

```bash
vercel dev
```

Then visit: `http://localhost:3000`

**Note**: You'll need to create a `.env` file with your API keys for local testing:

```env
TMDB_API_KEY=your_tmdb_key
OMDB_API_KEY=your_omdb_key
TRAKT_CLIENT_ID=your_trakt_client_id
```

## Architecture Overview

**Deployment Type**: Serverless Functions (Vercel)

**Frontend**: Static React app served from `/dist`
**Backend**: 3 serverless functions in `/api` directory
**Providers**: Existing factory functions (no changes needed)
**Routing**: All `/api/*` requests automatically route to serverless functions

## Free Tier Limits

Your deployment should fit comfortably within Vercel's free tier:

- ✅ 100GB bandwidth/month
- ✅ 100GB-hours serverless execution/month
- ✅ Automatic HTTPS
- ✅ CDN included
- ✅ No credit card required

## Troubleshooting

### Issue: "Module not found" errors
**Solution**: Ensure all imports use `.js` extensions as shown in the serverless functions

### Issue: API keys not working
**Solution**:
1. Check that environment variables are set: `vercel env ls`
2. Redeploy after adding env vars: `vercel --prod`

### Issue: CORS errors
**Solution**: Should not occur since frontend and API are same-origin. If it does, check the CORS headers in the API functions.

### Issue: Cold start latency
**Expected**: First request after inactivity may take 1-2 seconds. This is normal for serverless functions on the free tier.

## Next Steps

After successful deployment:

1. Update your GitHub repository README with the live URL
2. Test all features (search, episode charts, dark mode)
3. Monitor usage in Vercel dashboard
4. Consider upgrading to Pro plan if you exceed free tier limits

## Rollback

If you need to rollback to a previous deployment:

```bash
vercel rollback
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel CLI Reference: https://vercel.com/docs/cli
- Project Issues: https://github.com/AleBonatti/BingScore2026/issues

---

Enjoy your deployed BingeScore app! 🎬📊
