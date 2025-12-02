/**
 * CORS Plugin
 * Configures CORS for frontend communication
 */

import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: false,
  });
};

export default corsPlugin;
