import 'dotenv/config';
import { createApp } from './app.js';

const start = async () => {
  try {
    const app = await createApp();
    const port = parseInt(process.env.PORT || '4000', 10);

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
