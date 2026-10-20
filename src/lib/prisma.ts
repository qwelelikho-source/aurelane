import { PrismaClient } from '@prisma/client';
import { env } from './env';

// This file is server-only
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
