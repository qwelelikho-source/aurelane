import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTransactions, deleteTransaction } from '../data/transactions';
import { prisma } from '../prisma';

vi.mock('../prisma', () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('Ownership Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTransactions ownership', () => {
    it('should only return transactions for the requesting user', async () => {
      const mockTransactions = [
        { id: 'tx1', userId: 'user-a', amountCents: 1000 },
        { id: 'tx2', userId: 'user-a', amountCents: 2000 },
      ];

      (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransactions);

      const result = await getTransactions('user-a');

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-a' },
        orderBy: { date: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(result.every((tx: { userId: string }) => tx.userId === 'user-a')).toBe(true);
    });

    it('should not return transactions for other users', async () => {
      const mockTransactions = [
        { id: 'tx1', userId: 'user-b', amountCents: 1000 },
      ];

      (prisma.transaction.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransactions);

      const result = await getTransactions('user-b');

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-b' },
        orderBy: { date: 'desc' },
      });

      expect(result.every((tx: { userId: string }) => tx.userId === 'user-b')).toBe(true);
    });
  });

  describe('deleteTransaction ownership', () => {
    it('should only delete transactions owned by the requesting user', async () => {
      (prisma.transaction.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });

      await deleteTransaction('user-a', 'tx1');

      expect(prisma.transaction.deleteMany).toHaveBeenCalledWith({
        where: { id: 'tx1', userId: 'user-a' },
      });
    });

    it('should throw error when trying to delete another user transaction', async () => {
      (prisma.transaction.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 0 });

      await expect(deleteTransaction('user-b', 'tx1')).rejects.toThrow(
        'Transaction not found or access denied'
      );
    });

    it('should prevent deletion when count is 0 (not owned)', async () => {
      (prisma.transaction.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 0 });

      await expect(deleteTransaction('user-a', 'tx-owned-by-b')).rejects.toThrow(
        'Transaction not found or access denied'
      );
    });

    it('should allow deletion when count is 1 (owned)', async () => {
      (prisma.transaction.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });

      const result = await deleteTransaction('user-a', 'tx1');

      expect(result).toEqual({ count: 1 });
    });
  });
});
