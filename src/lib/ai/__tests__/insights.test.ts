import { describe, it, expect } from 'vitest';
import { generateFallbackInsight } from '@/lib/ai/fallback';
import { InsightSummary } from '@/lib/insights/rules';

describe('AI Layer', () => {
  describe('generateFallbackInsight', () => {
    it('returns not_enough_data status with few data days', () => {
      const summary: InsightSummary = {
        userId: 'user1',
        month: '2026-11',
        monthlySavingsRate: 10,
        budgetStatuses: [],
        projectedMonthEndSpendCents: 5000,
        monthComparison: null,
        topCategories: [],
        overallStatus: 'not_enough_data',
        dataDays: 3,
      };

      const result = generateFallbackInsight(summary);
      expect(result.status).toBe('not_enough_data');
      expect(result.headline).toContain('Building your financial picture');
    });

    it('returns overspending status when over budget', () => {
      const summary: InsightSummary = {
        userId: 'user1',
        month: '2026-11',
        monthlySavingsRate: -10,
        budgetStatuses: [
          { category: 'Food', spentCents: 120, limitCents: 100, percentage: 120, status: 'over' },
        ],
        projectedMonthEndSpendCents: 6000,
        monthComparison: null,
        topCategories: [],
        overallStatus: 'overspending',
        dataDays: 15,
      };

      const result = generateFallbackInsight(summary);
      expect(result.status).toBe('overspending');
      expect(result.headline).toContain('Budget alert');
    });

    it('returns watch status when approaching limits', () => {
      const summary: InsightSummary = {
        userId: 'user1',
        month: '2026-11',
        monthlySavingsRate: 5,
        budgetStatuses: [
          { category: 'Food', spentCents: 85, limitCents: 100, percentage: 85, status: 'watch' },
        ],
        projectedMonthEndSpendCents: 5000,
        monthComparison: null,
        topCategories: [],
        overallStatus: 'watch',
        dataDays: 15,
      };

      const result = generateFallbackInsight(summary);
      expect(result.status).toBe('watch');
      expect(result.headline).toContain('Monitor your spending');
    });

    it('returns on_track status when doing well', () => {
      const summary: InsightSummary = {
        userId: 'user1',
        month: '2026-11',
        monthlySavingsRate: 20,
        budgetStatuses: [],
        projectedMonthEndSpendCents: 4000,
        monthComparison: null,
        topCategories: [
          { category: 'Food', spentCents: 3000 },
        ],
        overallStatus: 'on_track',
        dataDays: 15,
      };

      const result = generateFallbackInsight(summary);
      expect(result.status).toBe('on_track');
      expect(result.headline).toContain('on track');
    });
  });
});
