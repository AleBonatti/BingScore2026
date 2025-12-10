/**
 * Register TypeScript path aliases for serverless functions
 * This ensures @/* imports resolve correctly at runtime
 */

import { register } from 'tsconfig-paths';
import { resolve } from 'path';

// Register paths only once
if (!(global as any).__PATHS_REGISTERED__) {
  register({
    baseUrl: resolve(__dirname, '../..'),
    paths: {
      '@/*': ['./*'],
    },
  });
  (global as any).__PATHS_REGISTERED__ = true;
}
