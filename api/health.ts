/**
 * Health Check Endpoint
 * Vercel serverless function for health checks
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ status: 'ok' });
}
