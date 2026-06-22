import { PrismaClient } from '@prisma/client';

/**
 * Shared PrismaClient instance.
 * DATABASE_URL is read from environment (see backend/.env).
 * For tests, set DATABASE_URL to a test database path before importing.
 */
export const prisma = new PrismaClient();
