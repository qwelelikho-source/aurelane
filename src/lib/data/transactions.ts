import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amountCents: z.number().int().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.date(),
});

export async function createTransaction(userId: string, data: unknown) {
  const parsed = transactionSchema.parse(data);

  return prisma.transaction.create({
    data: {
      ...parsed,
      userId,
    },
  });
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
