import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';                     // ← this line caused the error
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env';

const connectionString = env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,                            // ← required in Prisma 7+
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}