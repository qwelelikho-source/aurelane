import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/lib/env';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

async function main() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  await prisma.user.upsert({
    where: { email: 'demo@aurelane.com' },
    update: {},
    create: {
      email: 'demo@aurelane.com',
      name: 'Demo User',
      passwordHash,
      transactions: {
        create: [
          {
            type: 'INCOME',
            amountCents: 500000, // R5,000.00
            category: 'Salary',
            description: 'Monthly salary',
            date: new Date('2026-10-01'),
          },
          {
            type: 'INCOME',
            amountCents: 150000, // R1,500.00
            category: 'Freelance',
            description: 'Web design project',
            date: new Date('2026-10-05'),
          },
          {
            type: 'EXPENSE',
            amountCents: 120000, // R1,200.00
            category: 'Rent',
            description: 'Monthly rent',
            date: new Date('2026-10-02'),
          },
          {
            type: 'EXPENSE',
            amountCents: 45000, // R450.00
            category: 'Groceries',
            description: 'Weekly groceries',
            date: new Date('2026-10-03'),
          },
          {
            type: 'EXPENSE',
            amountCents: 25000, // R250.00
            category: 'Utilities',
            description: 'Electricity bill',
            date: new Date('2026-10-04'),
          },
          {
            type: 'EXPENSE',
            amountCents: 80000, // R800.00
            category: 'Transport',
            description: 'Petrol',
            date: new Date('2026-10-06'),
          },
          {
            type: 'EXPENSE',
            amountCents: 35000, // R350.00
            category: 'Dining',
            description: 'Restaurant dinner',
            date: new Date('2026-10-07'),
          },
          {
            type: 'EXPENSE',
            amountCents: 15000, // R150.00
            category: 'Entertainment',
            description: 'Netflix subscription',
            date: new Date('2026-10-08'),
          },
        ],
      },
      budgets: {
        create: [
          {
            category: 'Groceries',
            monthlyLimitCents: 200000, // R2,000.00
            month: new Date('2026-10-01'),
          },
          {
            category: 'Transport',
            monthlyLimitCents: 150000, // R1,500.00
            month: new Date('2026-10-01'),
          },
          {
            category: 'Dining',
            monthlyLimitCents: 100000, // R1,000.00
            month: new Date('2026-10-01'),
          },
        ],
      },
      savingsGoals: {
        create: [
          {
            name: 'Emergency Fund',
            targetCents: 10000000, // R100,000.00
            savedCents: 2500000, // R25,000.00
            targetDate: new Date('2027-12-31'),
          },
          {
            name: 'Vacation',
            targetCents: 5000000, // R50,000.00
            savedCents: 1200000, // R12,000.00
            targetDate: new Date('2027-06-30'),
          },
        ],
      },
    },
  });

  console.log('Seed data created. Demo user: demo@aurelane.com / demo123');
  console.log('Note: All amounts are SAMPLE FIGURES for demonstration purposes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
