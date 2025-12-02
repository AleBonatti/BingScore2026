import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import searchRoutes from './routes/search.js';
import mediaRoutes from './routes/media.js';

export async function createApp() {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins (T036)
  await app.register(corsPlugin);
  await app.register(errorHandlerPlugin);

  // Register routes (T053, T094)
  await app.register(searchRoutes);
  await app.register(mediaRoutes);

  // Health check endpoint (T027)
  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
}
