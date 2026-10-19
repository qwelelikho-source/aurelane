import { PrismaClient } from '@prisma/client';

// This file is server-only
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server');
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
