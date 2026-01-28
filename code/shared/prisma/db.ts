import { PrismaClient, User, Role, BranchType, SaleSource, PaymentStatus, DiscountType, ProductHistoryType, TransferStatus, RequisitionStatus, TaskPriority, TaskStatus, Prisma } from '@prisma/client';
export { PrismaClient, BranchType, SaleSource, PaymentStatus, DiscountType, ProductHistoryType, TransferStatus, RequisitionStatus, TaskPriority, TaskStatus, Prisma };
export type { User, Role };
import { Pool } from 'pg';                     // ← this line caused the error
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env';

const connectionString = env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Force re-initialization if new models like 'branch' or 'productHistory' are missing from the cached instance
const isStale = globalForPrisma.prisma && (!('branch' in globalForPrisma.prisma) || !('productHistory' in globalForPrisma.prisma));

export const db =
  (globalForPrisma.prisma && !isStale) ?
    globalForPrisma.prisma :
    new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}