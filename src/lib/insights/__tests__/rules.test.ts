import { describe, it, expect } from 'vitest';
import {
  calculateMonthlySavingsRate,
  calculateBudgetStatus,
  calculateProjectedMonthEndSpend,
  getDaysInMonth,
  determineOverallStatus,
  getTopCategories,
} from '@/lib/insights/rules';

describe('Rules Engine', () => {
  describe('calculateMonthlySavingsRate', () => {
    it('calculates positive savings rate', () => {
      expect(calculateMonthlySavingsRate(10000, 7000)).toBe(30);
    });

    it('returns 0 when income is zero', () => {
      expect(calculateMonthlySavingsRate(0, 5000)).toBe(0);
    });

    it('handles overspending (negative savings)', () => {
      expect(calculateMonthlySavingsRate(5000, 7000)).toBe(-40);
    });

    it('returns 100% when no expenses', () => {
      expect(calculateMonthlySavingsRate(10000, 0)).toBe(100);
    });
  });

  describe('calculateBudgetStatus', () => {
    it('returns ok when under 80%', () => {
      expect(calculateBudgetStatus(70, 100)).toBe('ok');
    });

    it('returns watch at 80%', () => {
      expect(calculateBudgetStatus(80, 100)).toBe('watch');
    });

    it('returns watch over 80%', () => {
      expect(calculateBudgetStatus(85, 100)).toBe('watch');
    });

    it('returns over at 100%', () => {
      expect(calculateBudgetStatus(100, 100)).toBe('over');
    });

    it('returns over over 100%', () => {
      expect(calculateBudgetStatus(120, 100)).toBe('over');
    });

    it('returns ok when limit is zero', () => {
      expect(calculateBudgetStatus(50, 0)).toBe('ok');
    });
  });

  describe('calculateProjectedMonthEndSpend', () => {
    it('projects based on daily rate', () => {
      expect(calculateProjectedMonthEndSpend(3000, 15, 30)).toBe(6000);
    });

    it('handles day 1', () => {
      expect(calculateProjectedMonthEndSpend(100, 1, 30)).toBe(3000);
    });

    it('returns current spend on day 0', () => {
      expect(calculateProjectedMonthEndSpend(5000, 0, 30)).toBe(5000);
    });
  });

  describe('getDaysInMonth', () => {
    it('returns 31 for January', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31);
    });

    it('returns 28 for February in non-leap year', () => {
      expect(getDaysInMonth(2026, 2)).toBe(28);
    });

    it('returns 29 for February in leap year', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
    });

    it('returns 30 for April', () => {
      expect(getDaysInMonth(2026, 4)).toBe(30);
    });
  });

  describe('determineOverallStatus', () => {
    it('returns not_enough_data with fewer than 7 days', () => {
      expect(determineOverallStatus(10, [], 5)).toBe('not_enough_data');
    });

    it('returns overspending when savings rate is negative', () => {
      expect(determineOverallStatus(-10, [], 10)).toBe('overspending');
    });

    it('returns overspending when any budget is over', () => {
      const budgets = [
        { category: 'Food', spentCents: 100, limitCents: 50, percentage: 200, status: 'over' as const },
      ];
      expect(determineOverallStatus(10, budgets, 10)).toBe('overspending');
    });

    it('returns watch when savings rate is low', () => {
      expect(determineOverallStatus(5, [], 10)).toBe('watch');
    });

    it('returns watch when any budget is at watch level', () => {
      const budgets = [
        { category: 'Food', spentCents: 85, limitCents: 100, percentage: 85, status: 'watch' as const },
      ];
      expect(determineOverallStatus(15, budgets, 10)).toBe('watch');
    });

    it('returns on_track when everything is good', () => {
      expect(determineOverallStatus(20, [], 10)).toBe('on_track');
    });
  });

  describe('getTopCategories', () => {
    it('returns top 3 categories by spending', () => {
      const spending = {
        'Food': 5000,
        'Transport': 3000,
        'Entertainment': 2000,
        'Utilities': 1000,
      };
      const result = getTopCategories(spending, 3);
      expect(result).toHaveLength(3);
      expect(result[0].category).toBe('Food');
      expect(result[1].category).toBe('Transport');
      expect(result[2].category).toBe('Entertainment');
    });

    it('handles fewer categories than limit', () => {
      const spending = { 'Food': 5000 };
      const result = getTopCategories(spending, 3);
      expect(result).toHaveLength(1);
    });

    it('handles empty spending', () => {
      const result = getTopCategories({}, 3);
      expect(result).toHaveLength(0);
    });
  });
});
