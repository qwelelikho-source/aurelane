import 'server-only';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const goalSchema = z.object({
  name: z.string().trim().min(1).max(100),
  targetCents: z.number().int().positive(),
  savedCents: z.number().int().min(0),
  targetDate: z.string().nullable().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

export async function createGoal(userId: string, input: GoalInput) {
  const validation = goalSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'VALIDATION', fields: validation.error.flatten().fieldErrors };
  }

  const { name, targetCents, savedCents, targetDate } = validation.data;

  try {
    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name,
        targetCents,
        savedCents,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });
    return { success: true, data: goal };
  } catch (error) {
    console.error('GOAL_CREATE_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function getGoals(userId: string) {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
    });

    const goalsWithProgress = goals.map((goal) => {
      const remainingCents = goal.targetCents - goal.savedCents;
      const percentage = goal.targetCents > 0 ? (goal.savedCents / goal.targetCents) * 100 : 0;
      const cappedPercentage = Math.min(percentage, 100);

      let monthlyNeededCents = 0;
      if (goal.targetDate) {
        const now = new Date();
        const target = new Date(goal.targetDate);
        const monthsRemaining = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        monthlyNeededCents = Math.ceil(remainingCents / monthsRemaining);
      }

      return {
        ...goal,
        remainingCents,
        percentage: cappedPercentage,
        monthlyNeededCents,
      };
    });

    return { success: true, data: goalsWithProgress };
  } catch (error) {
    console.error('GOAL_GET_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function getGoalById(userId: string, id: string) {
  try {
    const goal = await prisma.savingsGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (goal.userId !== userId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    const remainingCents = goal.targetCents - goal.savedCents;
    const percentage = goal.targetCents > 0 ? (goal.savedCents / goal.targetCents) * 100 : 0;
    const cappedPercentage = Math.min(percentage, 100);

    let monthlyNeededCents = 0;
    if (goal.targetDate) {
      const now = new Date();
      const target = new Date(goal.targetDate);
      const monthsRemaining = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      monthlyNeededCents = Math.ceil(remainingCents / monthsRemaining);
    }

    return {
      success: true,
      data: {
        ...goal,
        remainingCents,
        percentage: cappedPercentage,
        monthlyNeededCents,
      },
    };
  } catch (error) {
    console.error('GOAL_GET_BY_ID_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function updateGoal(userId: string, id: string, input: Partial<GoalInput>) {
  const validation = goalSchema.partial().safeParse(input);
  if (!validation.success) {
    return { success: false, error: 'VALIDATION', fields: validation.error.flatten().fieldErrors };
  }

  try {
    const existing = await prisma.savingsGoal.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    const updateData: any = { ...validation.data };
    if (validation.data.targetDate) {
      updateData.targetDate = new Date(validation.data.targetDate);
    }

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: goal };
  } catch (error) {
    console.error('GOAL_UPDATE_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function contributeToGoal(userId: string, id: string, amountCents: number) {
  if (amountCents <= 0) {
    return { success: false, error: 'VALIDATION', fields: { amountCents: 'Amount must be positive' } };
  }

  try {
    const existing = await prisma.savingsGoal.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        savedCents: {
          increment: amountCents,
        },
      },
    });

    return { success: true, data: goal };
  } catch (error) {
    console.error('GOAL_CONTRIBUTE_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}

export async function deleteGoal(userId: string, id: string) {
  try {
    const existing = await prisma.savingsGoal.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'NOT_FOUND' };
    }

    if (existing.userId !== userId) {
      return { success: false, error: 'FORBIDDEN' };
    }

    await prisma.savingsGoal.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('GOAL_DELETE_FAILED', error);
    return { success: false, error: 'DATABASE_ERROR' };
  }
}
