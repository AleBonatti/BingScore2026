/**
 * Media Aggregation Endpoint
 * Vercel serverless function for aggregating ratings from multiple providers
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTmdbProvider } from '../../server/providers/tmdb.js';
import { createOmdbProvider } from '../../server/providers/omdb.js';
import { createTraktProvider } from '../../server/providers/trakt.js';
import { aggregateRatings } from '../../lib/domain/aggregation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tmdbId, mediaType } = req.query;

    if (!tmdbId || !mediaType) {
      return res.status(400).json({ error: 'Required parameters: tmdbId, mediaType' });
    }

    const tmdbIdNum = Number(tmdbId);
    const type = mediaType as 'tv' | 'movie';

    if (isNaN(tmdbIdNum) || (type !== 'tv' && type !== 'movie')) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Create provider instances
    const tmdbProvider = createTmdbProvider(process.env.TMDB_API_KEY || '');
    const omdbProvider = createOmdbProvider(process.env.OMDB_API_KEY || '');
    const traktProvider = createTraktProvider(process.env.TRAKT_CLIENT_ID || '');

    // Use existing aggregation logic
    const result = await aggregateRatings(tmdbIdNum, type, {
      tmdbProvider,
      omdbProvider,
      traktProvider,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Aggregation error:', error);

    if (error instanceof Error && error.message.includes('404')) {
      return res.status(404).json({ error: 'Media not found' });
    }

    return res.status(502).json({ error: 'Failed to aggregate ratings from providers' });
  }
}
