import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient;
};

// Enhanced logging for debugging
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

// Test connection on initialization
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error);
});
