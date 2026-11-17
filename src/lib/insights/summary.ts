import 'server-only';
import { prisma } from '@/lib/prisma';
import { monthToDate, getNextMonthStart } from '@/lib/date-utils';
import {
  InsightSummary,
  calculateMonthlySavingsRate,
  calculateBudgetStatus,
  calculateProjectedMonthEndSpend,
  getDaysInMonth,
  determineOverallStatus,
  getTopCategories,
} from './rules';

export async function generateInsightSummary(userId: string, month: string): Promise<InsightSummary> {
  const monthDate = monthToDate(month);
  const monthStart = monthDate;
  const monthEnd = getNextMonthStart(month);
  const year = monthDate.getFullYear();
  const monthNum = monthDate.getMonth() + 1;
  const daysInMonth = getDaysInMonth(year, monthNum);
  const currentDay = new Date().getDate();

  // Get transactions for the month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });

  // Calculate totals
  const incomeCents = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const expenseCents = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountCents, 0);

  // Calculate category spending
  const categorySpending: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'EXPENSE')
    .forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amountCents;
    });

  // Get budgets for the month
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      month: monthDate,
    },
  });

  // Calculate budget statuses
  const budgetStatuses = budgets.map(budget => {
    const spentCents = categorySpending[budget.category] || 0;
    return {
      category: budget.category,
      spentCents,
      limitCents: budget.monthlyLimitCents,
      percentage: budget.monthlyLimitCents > 0 ? (spentCents / budget.monthlyLimitCents) * 100 : 0,
      status: calculateBudgetStatus(spentCents, budget.monthlyLimitCents),
    };
  });

  // Calculate monthly savings rate
  const monthlySavingsRate = calculateMonthlySavingsRate(incomeCents, expenseCents);

  // Calculate projected month-end spend
  const projectedMonthEndSpendCents = calculateProjectedMonthEndSpend(
    expenseCents,
    currentDay,
    daysInMonth
  );

  // Get previous month comparison
  const previousMonthDate = new Date(year, monthNum - 2, 1);
  const previousMonthEnd = monthDate;
  const previousMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: previousMonthDate,
        lt: previousMonthEnd,
      },
    },
  });

  const previousIncomeCents = previousMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const previousExpenseCents = previousMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const monthComparison = previousMonthTransactions.length > 0 ? {
    currentMonth: { incomeCents, expenseCents },
    previousMonth: { incomeCents: previousIncomeCents, expenseCents: previousExpenseCents },
    incomeChange: previousIncomeCents > 0 ? ((incomeCents - previousIncomeCents) / previousIncomeCents) * 100 : 0,
    expenseChange: previousExpenseCents > 0 ? ((expenseCents - previousExpenseCents) / previousExpenseCents) * 100 : 0,
  } : null;

  // Get top categories
  const topCategories = getTopCategories(categorySpending, 3);

  // Count data days (unique days with transactions)
  const dataDays = new Set(transactions.map(t => t.date.toDateString())).size;

  // Determine overall status
  const overallStatus = determineOverallStatus(monthlySavingsRate, budgetStatuses, dataDays);

  return {
    userId,
    month,
    monthlySavingsRate,
    budgetStatuses,
    projectedMonthEndSpendCents,
    monthComparison,
    topCategories,
    overallStatus,
    dataDays,
  };
}
