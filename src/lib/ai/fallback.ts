import { InsightSummary } from '@/lib/insights/rules';

export type AIInsight = {
  status: 'on_track' | 'watch' | 'overspending' | 'not_enough_data';
  headline: string;
  observations: string[];
  suggestion: string;
};

export function generateFallbackInsight(summary: InsightSummary): AIInsight {
  const { overallStatus, monthlySavingsRate, budgetStatuses, topCategories, dataDays } = summary;

  if (overallStatus === 'not_enough_data') {
    return {
      status: 'not_enough_data',
      headline: 'Building your financial picture',
      observations: [
        `You have ${dataDays} days of transaction data for this month`,
        'Continue tracking your spending to get personalized insights',
        'Add transactions regularly for better analysis',
      ],
      suggestion: 'Try to log your spending daily for at least two weeks to unlock full insights.',
    };
  }

  if (overallStatus === 'overspending') {
    const overBudget = budgetStatuses.filter(b => b.status === 'over');
    return {
      status: 'overspending',
      headline: 'Budget alert: spending exceeds limits',
      observations: [
        `${overBudget.length} categor${overBudget.length === 1 ? 'y is' : 'ies are'} over budget`,
        overBudget.map(b => `${b.category} at ${b.percentage.toFixed(0)}% of limit`).join(', '),
        `Savings rate is ${monthlySavingsRate.toFixed(1)}%`,
      ],
      suggestion: overBudget.length > 0
        ? `Review spending in ${overBudget[0].category} and consider reducing expenses next month.`
        : 'Review your spending patterns and identify areas to reduce.',
    };
  }

  if (overallStatus === 'watch') {
    const watchBudget = budgetStatuses.filter(b => b.status === 'watch');
    return {
      status: 'watch',
      headline: 'Monitor your spending closely',
      observations: [
        `${watchBudget.length} categor${watchBudget.length === 1 ? 'y is' : 'ies are'} approaching budget limits`,
        watchBudget.map(b => `${b.category} at ${b.percentage.toFixed(0)}% of limit`).join(', '),
        `Savings rate is ${monthlySavingsRate.toFixed(1)}%`,
      ],
      suggestion: watchBudget.length > 0
        ? `Keep an eye on ${watchBudget[0].category} spending for the rest of the month.`
        : 'Continue monitoring your spending to stay on track.',
    };
  }

  // on_track
  return {
    status: 'on_track',
    headline: 'You\'re on track this month',
    observations: [
      `Savings rate is ${monthlySavingsRate.toFixed(1)}%`,
      `Top spending: ${topCategories[0]?.category || 'No data yet'}`,
      `All budgets are within limits`,
    ],
    suggestion: 'Keep up the good work! Consider increasing your savings rate if possible.',
  };
}
