import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Use the pooled connection in serverless (Vercel). The direct POSTGRES_URL
// is only for migrations.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Cache the client on globalThis so warm serverless invocations reuse a single
// instance instead of opening a new connection pool on every request.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
