import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMonthlyTotals } from '../data/transactions';
import { prisma } from '../prisma';

vi.mock('../prisma', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
    },
  },
}));

describe('getMonthlyTotals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate total income, expenses, and remaining for a month', async () => {
    const mockTransactions = [
      { type: 'INCOME', amountCents: 500000 },
      { type: 'INCOME', amountCents: 150000 },
      { type: 'EXPENSE', amountCents: 120000 },
      { type: 'EXPENSE', amountCents: 45000 },
      { type: 'EXPENSE', amountCents: 25000 },
    ];

    (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransactions);

    const result = await getMonthlyTotals('user-123', 2026, 10);

    expect(result.totalIncome).toBe(650000);
    expect(result.totalExpenses).toBe(190000);
    expect(result.remaining).toBe(460000);
  });

  it('should handle empty transactions', async () => {
    (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await getMonthlyTotals('user-123', 2026, 10);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.remaining).toBe(0);
  });

  it('should call prisma with correct date range', async () => {
    (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await getMonthlyTotals('user-123', 2026, 10);

    const startDate = new Date(2026, 9, 1);
    const endDate = new Date(2026, 10, 1, 0, 0, 0, -1);

    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-123',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  });
});
