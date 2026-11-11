import { z } from 'zod';

export interface FilterOptions {
  month?: string; // YYYY-MM
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  category?: string;
  type?: 'INCOME' | 'EXPENSE';
}

export function parseFilters(searchParams: URLSearchParams): FilterOptions {
  const month = searchParams.get('month');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const category = searchParams.get('category');
  const type = searchParams.get('type');

  const filters: FilterOptions = {};

  if (month) {
    const monthValidation = z.string().regex(/^\d{4}-\d{2}$/).safeParse(month);
    if (monthValidation.success) {
      filters.month = monthValidation.data;
    }
  }

  if (from) {
    const fromValidation = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(from);
    if (fromValidation.success) {
      filters.from = fromValidation.data;
    }
  }

  if (to) {
    const toValidation = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(to);
    if (toValidation.success) {
      filters.to = toValidation.data;
    }
  }

  if (category) {
    filters.category = category;
  }

  if (type === 'INCOME' || type === 'EXPENSE') {
    filters.type = type;
  }

  return filters;
}

export function getDateRangeFromFilters(filters: FilterOptions): { start: Date; end: Date } | null {
  // If custom date range is provided, use it
  if (filters.from && filters.to) {
    return {
      start: new Date(filters.from),
      end: new Date(filters.to),
    };
  }

  // If month is provided, use it
  if (filters.month) {
    const [year, month] = filters.month.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { start, end };
  }

  // Default to current month
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}
