import { defineConfig } from 'vitest/config';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, 'prisma', 'test.db');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 20000,
    fileParallelism: false,
    pool: 'forks',
    env: {
      DATABASE_URL: `file:${TEST_DB_PATH}`,
    },
  },
});
