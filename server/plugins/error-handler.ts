/**
 * Error Handler Plugin
 * Centralized error handling for all routes
 */

import { FastifyPluginAsync, FastifyError } from 'fastify';
import type { ErrorResponse } from '@/lib/types/api.js';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    fastify.log.error(error);

    const statusCode = error.statusCode || 500;

    const errorResponse: ErrorResponse = {
      data: null,
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code,
      },
    };

    reply.status(statusCode).send(errorResponse);
  });
};

export default errorHandlerPlugin;
