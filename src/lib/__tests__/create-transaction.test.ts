import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTransaction } from '../data/transactions';
import { prisma } from '../prisma';

vi.mock('../prisma', () => ({
  prisma: {
    transaction: {
      create: vi.fn(),
    },
  },
}));

describe('createTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create transaction with valid input', async () => {
    const mockTransaction = {
      id: 'tx1',
      type: 'INCOME',
      amountCents: 50000,
      category: 'Salary',
      description: 'Monthly salary',
      date: new Date('2026-10-01'),
      userId: 'user-123',
    };

    (prisma.transaction.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransaction);

    const result = await createTransaction('user-123', {
      type: 'INCOME',
      amount: '500.00',
      category: 'Salary',
      description: 'Monthly salary',
      date: '2026-10-01',
    });

    expect(result).not.toHaveProperty('error');
    expect(result.transaction).toEqual(mockTransaction);
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: {
        type: 'INCOME',
        amountCents: 50000,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date('2026-10-01'),
        userId: 'user-123',
      },
    });
  });

  it('should handle empty description by storing null', async () => {
    const mockTransaction = {
      id: 'tx1',
      type: 'EXPENSE',
      amountCents: 10000,
      category: 'Groceries',
      description: null,
      date: new Date('2026-10-01'),
      userId: 'user-123',
    };

    (prisma.transaction.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransaction);

    const result = await createTransaction('user-123', {
      type: 'EXPENSE',
      amount: '100.00',
      category: 'Groceries',
      description: '',
      date: '2026-10-01',
    });

    expect(result).not.toHaveProperty('error');
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: null,
      }),
    });
  });

  it('should return validation error for invalid amount', async () => {
    const result = await createTransaction('user-123', {
      type: 'INCOME',
      amount: 'abc',
      category: 'Salary',
      date: '2026-10-01',
    });

    expect(result.error).toBe('VALIDATION');
    expect(result.fields).toHaveProperty('amount');
  });

  it('should return validation error for invalid date format', async () => {
    const result = await createTransaction('user-123', {
      type: 'INCOME',
      amount: '500.00',
      category: 'Salary',
      date: 'invalid-date',
    });

    expect(result.error).toBe('VALIDATION');
    expect(result.fields).toHaveProperty('date');
  });

  it('should return validation error for date outside allowed range', async () => {
    const result = await createTransaction('user-123', {
      type: 'INCOME',
      amount: '500.00',
      category: 'Salary',
      date: '1800-01-01',
    });

    expect(result.error).toBe('VALIDATION');
    expect(result.fields).toHaveProperty('date');
  });

  it('should return validation error for missing category', async () => {
    const result = await createTransaction('user-123', {
      type: 'INCOME',
      amount: '500.00',
      category: '',
      date: '2026-10-01',
    });

    expect(result.error).toBe('VALIDATION');
    expect(result.fields).toHaveProperty('category');
  });

  it('should return server error on database failure', async () => {
    (prisma.transaction.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Database error')
    );

    const result = await createTransaction('user-123', {
      type: 'INCOME',
      amount: '500.00',
      category: 'Salary',
      date: '2026-10-01',
    });

    expect(result.error).toBe('SERVER_ERROR');
    expect(result.message).toBe('Failed to create transaction');
  });
});
