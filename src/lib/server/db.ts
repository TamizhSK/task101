import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient;
  process?: { env?: Record<string, string | undefined> };
};

const nodeEnv = globalForPrisma.process?.env?.NODE_ENV ?? 'production';

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (nodeEnv !== 'production') {
  globalForPrisma.__prisma = prisma;
}
