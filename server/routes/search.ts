/**
 * Search Routes
 * Handles search endpoint
 */

import { FastifyPluginAsync } from 'fastify';
import { createTmdbProvider } from '../providers/tmdb.js';
import type { SearchQueryParams, SearchResponse } from '../../lib/types/api.js';

const searchRoutes: FastifyPluginAsync = async (fastify) => {
  const tmdbProvider = createTmdbProvider(process.env.TMDB_API_KEY || '');

  fastify.get<{ Querystring: SearchQueryParams }>(
    '/api/search',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string', minLength: 2 },
          },
        },
      },
    },
    async (request, reply) => {
      const { q } = request.query;

      try {
        const results: SearchResponse = await tmdbProvider.searchMulti(q);
        return results;
      } catch (error) {
        fastify.log.error(error);
        reply.code(502).send({
          data: null,
          error: {
            message: 'Failed to fetch search results from TMDB',
            code: 'TMDB_ERROR',
          },
        });
      }
    }
  );
};

export default searchRoutes;
