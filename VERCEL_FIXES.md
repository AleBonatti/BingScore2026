# Vercel Deployment Fixes

## Issues Fixed

### 1. 404 Errors on All API Routes

**Problem**: All `/api/*` routes returned 404 errors.

**Root Causes**:
1. Incorrect `rewrites` configuration in `vercel.json`
2. Import paths using `.js` extensions (TypeScript doesn't handle these in Vercel)
3. Missing TypeScript path alias resolution for `@/*` imports

**Solutions Applied**:

#### Fix 1: Removed Rewrites from vercel.json
Vercel automatically routes files in the `api/` directory without needing rewrites.

**Before**:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**After**:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

#### Fix 2: Removed .js Extensions from Imports
Vercel's TypeScript compiler doesn't handle `.js` extensions in import paths.

**Changed files**:
- `api/search.ts`
- `api/media/aggregate.ts`

**Before**:
```typescript
import { createTmdbProvider } from '../server/providers/tmdb.js';
```

**After**:
```typescript
import { createTmdbProvider } from '../server/providers/tmdb';
```

#### Fix 3: Created api/tsconfig.json
Added TypeScript configuration for the API directory to resolve `@/*` path aliases used in provider files.

**File**: `api/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "baseUrl": "..",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["./**/*"],
  "exclude": ["node_modules"]
}
```

## Testing the Fixes

After redeploying, test these endpoints:

1. **Health Check**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   Expected: `{"status":"ok"}`

2. **Search**:
   ```bash
   curl "https://your-app.vercel.app/api/search?q=breaking%20bad"
   ```
   Expected: Array of search results

3. **Aggregation**:
   ```bash
   curl "https://your-app.vercel.app/api/media/aggregate?tmdbId=1396&mediaType=tv"
   ```
   Expected: Aggregated ratings object

## Redeploy

To apply these fixes, redeploy to Vercel:

```bash
vercel --prod
```

## Why These Issues Occurred

1. **Rewrites**: Vercel's automatic routing for the `api/` directory conflicts with custom rewrites
2. **JS Extensions**: TypeScript in Node.js uses `.js` extensions for ESM compatibility, but Vercel's build process doesn't handle them
3. **Path Aliases**: The `@/*` alias needs to be configured separately for each TypeScript compilation context (api vs src)

## Additional Notes

- The `server/` directory code remains unchanged
- Provider functions are already stateless and serverless-ready
- All frontend code works without modification
- Environment variables must still be configured in Vercel dashboard
