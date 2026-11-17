import 'server-only';
import { prisma } from '@/lib/prisma';
import { monthToDate, getNextMonthStart } from '@/lib/date-utils';

export interface MonthSummary {
  month: string;
  incomeCents: number;
  expenseCents: number;
  savingsCents: number;
  savingsRate: number;
  transactionCount: number;
}

export async function getMonthSummary(userId: string, month: string): Promise<MonthSummary> {
  const monthDate = monthToDate(month);
  const monthStart = monthDate;
  const monthEnd = getNextMonthStart(month);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });

  const incomeCents = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const expenseCents = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const savingsCents = incomeCents - expenseCents;
  const savingsRate = incomeCents > 0 ? (savingsCents / incomeCents) * 100 : 0;

  return {
    month,
    incomeCents,
    expenseCents,
    savingsCents,
    savingsRate,
    transactionCount: transactions.length,
  };
}

export interface BudgetStatus {
  category: string;
  limitCents: number;
  spentCents: number;
  remainingCents: number;
  percentage: number;
  status: 'ok' | 'watch' | 'over';
}

export async function getBudgetStatus(userId: string, month: string): Promise<BudgetStatus[]> {
  const monthDate = monthToDate(month);
  const monthStart = monthDate;
  const monthEnd = getNextMonthStart(month);

  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month: monthDate,
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });

  const categorySpending: Record<string, number> = {};
  transactions.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amountCents;
  });

  return budgets.map(budget => {
    const spentCents = categorySpending[budget.category] || 0;
    const remainingCents = budget.monthlyLimitCents - spentCents;
    const percentage = budget.monthlyLimitCents > 0 ? (spentCents / budget.monthlyLimitCents) * 100 : 0;
    let status: 'ok' | 'watch' | 'over' = 'ok';
    if (percentage >= 100) status = 'over';
    else if (percentage >= 80) status = 'watch';

    return {
      category: budget.category,
      limitCents: budget.monthlyLimitCents,
      spentCents,
      remainingCents,
      percentage,
      status,
    };
  });
}

export interface CategoryTrend {
  category: string;
  currentMonthCents: number;
  previousMonthCents: number;
  changeCents: number;
  changePercentage: number;
}

export async function getCategoryTrend(userId: string, month: string): Promise<CategoryTrend[]> {
  const monthDate = monthToDate(month);
  const monthStart = monthDate;
  const monthEnd = getNextMonthStart(month);

  const previousMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
  const previousMonthEnd = monthDate;

  const currentTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });

  const previousTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: previousMonthDate,
        lt: previousMonthEnd,
      },
    },
  });

  const currentSpending: Record<string, number> = {};
  currentTransactions.forEach(t => {
    currentSpending[t.category] = (currentSpending[t.category] || 0) + t.amountCents;
  });

  const previousSpending: Record<string, number> = {};
  previousTransactions.forEach(t => {
    previousSpending[t.category] = (previousSpending[t.category] || 0) + t.amountCents;
  });

  const allCategories = new Set([...Object.keys(currentSpending), ...Object.keys(previousSpending)]);

  return Array.from(allCategories).map(category => {
    const currentMonthCents = currentSpending[category] || 0;
    const previousMonthCents = previousSpending[category] || 0;
    const changeCents = currentMonthCents - previousMonthCents;
    const changePercentage = previousMonthCents > 0 ? (changeCents / previousMonthCents) * 100 : 0;

    return {
      category,
      currentMonthCents,
      previousMonthCents,
      changeCents,
      changePercentage,
    };
  }).sort((a, b) => b.currentMonthCents - a.currentMonthCents);
}
