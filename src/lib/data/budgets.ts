import 'server-only';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const budgetSchema = z.object({
  category: z.string().trim().min(1).max(50),
  monthlyLimitCents: z.number().int().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)'),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

export async function createBudget(userId: string, input: BudgetInput) {
  const validation = budgetSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'VALIDATION', fields: validation.error.flatten().fieldErrors };
  }

  const { category, monthlyLimitCents, month } = validation.data;

  try {
    const budget = await prisma.budget.create({
      data: {
        userId,
        category,
        monthlyLimitCents,
        month,
      },
    });
    return { success: true, data: budget };
  } catch (error) {
    console.error('BUDGET_CREATE_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function getBudgets(userId: string, month?: string) {
  try {
    const where: any = { userId };
    if (month) {
      where.month = month;
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: [{ month: 'desc' }, { category: 'asc' }],
    });

    // Calculate spent for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(`${budget.month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const spent = await prisma.transaction.aggregate({
          where: {
            userId,
            category: budget.category,
            type: 'EXPENSE',
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
          _sum: {
            amountCents: true,
          },
        });

        const spentCents = spent._sum.amountCents || 0;
        const remainingCents = budget.monthlyLimitCents - spentCents;
        const percentage = budget.monthlyLimitCents > 0 ? (spentCents / budget.monthlyLimitCents) * 100 : 0;

        return {
          ...budget,
          spentCents,
          remainingCents,
          percentage: Math.min(percentage, 100),
        };
      })
    );

    return { success: true, data: budgetsWithSpent };
  } catch (error) {
    console.error('BUDGET_GET_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function getBudgetById(userId: string, id: string) {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (budget.userId !== userId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    // Calculate spent
    const startDate = new Date(`${budget.month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const spent = await prisma.transaction.aggregate({
      where: {
        userId,
        category: budget.category,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amountCents: true,
      },
    });

    const spentCents = spent._sum.amountCents || 0;
    const remainingCents = budget.monthlyLimitCents - spentCents;
    const percentage = budget.monthlyLimitCents > 0 ? (spentCents / budget.monthlyLimitCents) * 100 : 0;

    return {
      success: true,
      data: {
        ...budget,
        spentCents,
        remainingCents,
        percentage: Math.min(percentage, 100),
      },
    };
  } catch (error) {
    console.error('BUDGET_GET_BY_ID_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function updateBudget(userId: string, id: string, input: Partial<BudgetInput>) {
  const validation = budgetSchema.partial().safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'VALIDATION', fields: validation.error.flatten().fieldErrors };
  }

  try {
    const existing = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: validation.data,
    });

    return { success: true, data: budget };
  } catch (error) {
    console.error('BUDGET_UPDATE_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function deleteBudget(userId: string, id: string) {
  try {
    const existing = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    await prisma.budget.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('BUDGET_DELETE_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}
