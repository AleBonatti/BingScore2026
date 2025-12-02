/**
 * Media Routes
 * Handles media aggregation endpoint
 */

import { FastifyPluginAsync } from 'fastify';
import { createTmdbProvider } from '../providers/tmdb.js';
import { createOmdbProvider } from '../providers/omdb.js';
import { createTraktProvider } from '../providers/trakt.js';
import { aggregateRatings } from '@/lib/domain/aggregation.js';
import type { AggregateQueryParams, AggregateResponse } from '@/lib/types/api.js';

const mediaRoutes: FastifyPluginAsync = async (fastify) => {
  const tmdbProvider = createTmdbProvider(process.env.TMDB_API_KEY || '');
  const omdbProvider = createOmdbProvider(process.env.OMDB_API_KEY || '');
  const traktProvider = createTraktProvider(process.env.TRAKT_CLIENT_ID || '');

  fastify.get<{ Querystring: AggregateQueryParams }>(
    '/api/media/aggregate',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['tmdbId', 'mediaType'],
          properties: {
            tmdbId: { type: 'number' },
            mediaType: { type: 'string', enum: ['movie', 'tv'] },
          },
        },
      },
    },
    async (request, reply) => {
      const { tmdbId, mediaType } = request.query;

      try {
        const result: AggregateResponse = await aggregateRatings(tmdbId, mediaType, {
          tmdbProvider,
          omdbProvider,
          traktProvider,
        });

        return result;
      } catch (error) {
        fastify.log.error(error);

        // Handle different error types
        if (error instanceof Error && error.message.includes('404')) {
          reply.code(404).send({
            data: null,
            error: {
              message: 'Media not found',
              code: 'NOT_FOUND',
            },
          });
          return;
        }

        reply.code(502).send({
          data: null,
          error: {
            message: 'Failed to aggregate ratings from providers',
            code: 'AGGREGATION_ERROR',
          },
        });
      }
    }
  );
};

export default mediaRoutes;
