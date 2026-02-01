
import { 
  PrismaClient, 
  Prisma,
  BranchType, 
  SaleSource, 
  PaymentStatus, 
  DiscountType, 
  ProductHistoryType, 
  TransferStatus, 
  RequisitionStatus, 
  TaskPriority, 
  TaskStatus, 
  RecurrenceType, 
  ActivityType, 
  ActivityModule,
  // Models
  User, 
  Role, 
  BranchSettings, 
  Task, 
  ActivityHistory, 
  Sale, 
  SaleItem, 
  Expense, 
  ExpenseCategory, 
  CashAccount, 
  CashTransaction,
  Branch,
  Product,
  Customer,
  Campaign,
  Message,
  MessageTemplate,
  WhatsAppSession,
  Transaction,
  Category,
  Supplier,
  SaleCategory,
  StockTransfer,
  StockTransferItem,
  Requisition,
  RequisitionItem,
  TaskCategory,
  InstallmentPayment,
  RefreshToken,
  Permission,
  Account,
  ProductHistory,
  PasswordResetToken
} from '@prisma/client';
import { Pool } from 'pg';
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

export { 
  PrismaClient, 
  Prisma,
  BranchType, 
  SaleSource, 
  PaymentStatus, 
  DiscountType, 
  ProductHistoryType, 
  TransferStatus, 
  RequisitionStatus, 
  TaskPriority, 
  TaskStatus, 
  RecurrenceType, 
  ActivityType, 
  ActivityModule 
};

export type { 
  User, 
  Role, 
  BranchSettings, 
  Task, 
  ActivityHistory, 
  Sale, 
  SaleItem, 
  Expense, 
  ExpenseCategory, 
  CashAccount, 
  CashTransaction,
  Branch,
  Product,
  Customer,
  Campaign,
  Message,
  MessageTemplate,
  WhatsAppSession,
  Transaction,
  Category,
  Supplier,
  SaleCategory,
  StockTransfer,
  StockTransferItem,
  Requisition,
  RequisitionItem,
  TaskCategory,
  InstallmentPayment,
  RefreshToken,
  Permission,
  Account,
  ProductHistory,
  PasswordResetToken
};