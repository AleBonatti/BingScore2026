/**
 * Search Endpoint
 * Vercel serverless function for TMDB search
 */

import './_helpers/register-paths';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTmdbProvider } from '../server/providers/tmdb';

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
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query parameter "q" required (min 2 chars)' });
    }

    const tmdbProvider = createTmdbProvider(process.env.TMDB_API_KEY || '');
    const results = await tmdbProvider.searchMulti(query);

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(502).json({ error: 'Failed to fetch search results from TMDB' });
  }
}
