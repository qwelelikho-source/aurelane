import { describe, it, expect } from 'vitest';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, getCategoriesByType } from '@/lib/categories';

describe('Category validation', () => {
  it('has correct income categories', () => {
    expect(INCOME_CATEGORIES).toEqual(['Salary', 'Freelance', 'Interest', 'Gift', 'Other']);
  });

  it('has correct expense categories', () => {
    expect(EXPENSE_CATEGORIES).toEqual(['Groceries', 'Rent', 'Transport', 'Utilities', 'Dining', 'Subscriptions', 'Health', 'Shopping', 'Travel', 'Other']);
  });

  it('returns income categories for INCOME type', () => {
    const categories = getCategoriesByType('INCOME');
    expect(categories).toEqual(INCOME_CATEGORIES);
  });

  it('returns expense categories for EXPENSE type', () => {
    const categories = getCategoriesByType('EXPENSE');
    expect(categories).toEqual(EXPENSE_CATEGORIES);
  });

  it('valid income categories are distinct', () => {
    const unique = new Set(INCOME_CATEGORIES);
    expect(unique.size).toBe(INCOME_CATEGORIES.length);
  });

  it('valid expense categories are distinct', () => {
    const unique = new Set(EXPENSE_CATEGORIES);
    expect(unique.size).toBe(EXPENSE_CATEGORIES.length);
  });

  it('income categories do not overlap with expense categories except Other', () => {
    const incomeSet = new Set(INCOME_CATEGORIES);
    const expenseSet = new Set(EXPENSE_CATEGORIES);
    const overlap = [...incomeSet].filter(x => expenseSet.has(x));
    expect(overlap).toEqual(['Other']);
  });
});
