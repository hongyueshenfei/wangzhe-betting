import { execSync } from 'child_process';
import path from 'path';
import { prisma } from '../src/utils/prisma';

/**
 * Test database setup.
 * Uses a dedicated SQLite test database so tests don't touch dev data.
 * DATABASE_URL is set via vitest.config.ts env, available before all module loading.
 */

beforeAll(async () => {
  // Push schema to test database
  execSync('npx prisma db push --force-reset --accept-data-loss', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
  });
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
