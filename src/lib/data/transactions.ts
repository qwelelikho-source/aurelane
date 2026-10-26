import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { parseRandToCents } from '@/lib/money';

// This file is server-only
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server');
}

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.string().min(1).refine((val) => {
    try {
      parseRandToCents(val);
      return true;
    } catch {
      return false;
    }
  }, { message: 'Invalid amount format' }), // Will be converted to cents
  category: z.string().min(1).max(50).trim(),
  description: z.string().max(200).trim().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
});

export async function createTransaction(userId: string, data: unknown) {
  const parsed = transactionSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      fieldErrors[field] = issue.message;
    });

    return {
      error: 'VALIDATION',
      fields: fieldErrors,
    };
  }

  const { type, amount, category, description, date } = parsed.data;

  // Convert amount from rand string to cents
  const amountCents = parseRandToCents(amount);

  // Convert date string to Date object
  const transactionDate = new Date(date);

  // Validate date is not absurdly far in past or future
  const minDate = new Date('2000-01-01');
  const maxDate = new Date('2100-12-31');

  if (transactionDate < minDate || transactionDate > maxDate) {
    return {
      error: 'VALIDATION',
      fields: {
        date: 'Date must be between 2000-01-01 and 2100-12-31',
      },
    };
  }

  // Treat empty description as null
  const finalDescription = description && description.length > 0 ? description : null;

  try {
    const transaction = await prisma.transaction.create({
      data: {
        type,
        amountCents,
        category,
        description: finalDescription,
        date: transactionDate,
        userId,
      },
    });

    return { transaction };
  } catch {
    console.error('[TX_CREATE_ERROR]', {
      code: 'TX_CREATE_FAILED',
      userId,
      category,
    });
    return {
      error: 'SERVER_ERROR',
      message: 'Failed to create transaction',
    };
  }
}

export async function getTransactions(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
}

export async function getRecentTransactions(userId: string, limit: number = 5) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
  });
}

export async function deleteTransaction(userId: string, id: string) {
  const result = await prisma.transaction.deleteMany({
    where: { id, userId },
  });

  if (result.count === 0) {
    throw new Error('Transaction not found or access denied');
  }

  return result;
}

export async function getTransactionsByMonth(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'desc' },
  });
}

export async function getMonthlyTotals(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1, 0, 0, 0, -1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalIncome = transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + t.amountCents, 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + t.amountCents, 0);

  return {
    totalIncome,
    totalExpenses,
    remaining: totalIncome - totalExpenses,
  };
}
