export type InsightStatus = 'on_track' | 'watch' | 'overspending' | 'not_enough_data';

export interface BudgetStatus {
  category: string;
  spentCents: number;
  limitCents: number;
  percentage: number;
  status: 'ok' | 'watch' | 'over';
}

export interface CategorySpending {
  category: string;
  spentCents: number;
}

export interface MonthComparison {
  currentMonth: {
    incomeCents: number;
    expenseCents: number;
  };
  previousMonth: {
    incomeCents: number;
    expenseCents: number;
  };
  incomeChange: number;
  expenseChange: number;
}

export interface InsightSummary {
  userId: string;
  month: string;
  monthlySavingsRate: number; // percentage of income saved
  budgetStatuses: BudgetStatus[];
  projectedMonthEndSpendCents: number;
  monthComparison: MonthComparison | null;
  topCategories: CategorySpending[];
  overallStatus: InsightStatus;
  dataDays: number; // number of days with transactions in the month
}

export function calculateMonthlySavingsRate(incomeCents: number, expenseCents: number): number {
  if (incomeCents <= 0) return 0;
  return ((incomeCents - expenseCents) / incomeCents) * 100;
}

export function calculateBudgetStatus(spentCents: number, limitCents: number): 'ok' | 'watch' | 'over' {
  if (limitCents <= 0) return 'ok';
  const percentage = (spentCents / limitCents) * 100;
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'watch';
  return 'ok';
}

export function calculateProjectedMonthEndSpend(
  currentSpentCents: number,
  dayOfMonth: number,
  daysInMonth: number
): number {
  if (dayOfMonth === 0) return currentSpentCents;
  const dailyRate = currentSpentCents / dayOfMonth;
  return Math.round(dailyRate * daysInMonth);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function determineOverallStatus(
  savingsRate: number,
  budgetStatuses: BudgetStatus[],
  dataDays: number
): InsightStatus {
  // Not enough data if less than 7 days of transactions
  if (dataDays < 7) return 'not_enough_data';

  // Check if any budget is over
  const hasOverBudget = budgetStatuses.some(b => b.status === 'over');
  if (hasOverBudget) return 'overspending';

  // Check if any budget is at watch level
  const hasWatchBudget = budgetStatuses.some(b => b.status === 'watch');
  if (hasWatchBudget) return 'watch';

  // Check savings rate
  if (savingsRate < 0) return 'overspending';
  if (savingsRate < 10) return 'watch';

  return 'on_track';
}

export function getTopCategories(
  categorySpending: Record<string, number>,
  limit: number = 3
): CategorySpending[] {
  return Object.entries(categorySpending)
    .map(([category, spentCents]) => ({ category, spentCents }))
    .sort((a, b) => b.spentCents - a.spentCents)
    .slice(0, limit);
}
