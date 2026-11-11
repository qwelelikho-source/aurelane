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

  // Generate 6 months of transactions (June - November 2026)
  const transactions = [];
  const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

  for (const month of months) {
    const [year, monthNum] = month.split('-').map(Number);

    // Monthly salary (25th of previous month or first business day)
    transactions.push({
      type: 'INCOME',
      amountCents: 550000, // R5,500.00
      category: 'Salary',
      description: 'Monthly salary',
      date: new Date(year, monthNum - 1, 25),
    });

    // Rent (1st of month)
    transactions.push({
      type: 'EXPENSE',
      amountCents: 850000, // R8,500.00
      category: 'Rent',
      description: 'Monthly rent',
      date: new Date(year, monthNum - 1, 1),
    });

    // Groceries (multiple transactions)
    transactions.push({
      type: 'EXPENSE',
      amountCents: 45000, // R450.00
      category: 'Groceries',
      description: 'Weekly groceries',
      date: new Date(year, monthNum - 1, 3),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 52000, // R520.00
      category: 'Groceries',
      description: 'Weekly groceries',
      date: new Date(year, monthNum - 1, 10),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 48000, // R480.00
      category: 'Groceries',
      description: 'Weekly groceries',
      date: new Date(year, monthNum - 1, 17),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 38000, // R380.00
      category: 'Groceries',
      description: 'Weekly groceries',
      date: new Date(year, monthNum - 1, 24),
    });

    // Fuel (weekly)
    transactions.push({
      type: 'EXPENSE',
      amountCents: 65000, // R650.00
      category: 'Transport',
      description: 'Petrol',
      date: new Date(year, monthNum - 1, 5),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 58000, // R580.00
      category: 'Transport',
      description: 'Petrol',
      date: new Date(year, monthNum - 1, 12),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 62000, // R620.00
      category: 'Transport',
      description: 'Petrol',
      date: new Date(year, monthNum - 1, 19),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 55000, // R550.00
      category: 'Transport',
      description: 'Petrol',
      date: new Date(year, monthNum - 1, 26),
    });

    // Subscriptions
    transactions.push({
      type: 'EXPENSE',
      amountCents: 15000, // R150.00
      category: 'Entertainment',
      description: 'Netflix subscription',
      date: new Date(year, monthNum - 1, 1),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 8900, // R89.00
      category: 'Entertainment',
      description: 'Spotify subscription',
      date: new Date(year, monthNum - 1, 15),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 9900, // R99.00
      category: 'Entertainment',
      description: 'YouTube Premium',
      date: new Date(year, monthNum - 1, 15),
    });

    // Dining (a few times per month)
    transactions.push({
      type: 'EXPENSE',
      amountCents: 35000, // R350.00
      category: 'Dining',
      description: 'Restaurant dinner',
      date: new Date(year, monthNum - 1, 8),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 28000, // R280.00
      category: 'Dining',
      description: 'Lunch out',
      date: new Date(year, monthNum - 1, 15),
    });
    transactions.push({
      type: 'EXPENSE',
      amountCents: 42000, // R420.00
      category: 'Dining',
      description: 'Weekend brunch',
      date: new Date(year, monthNum - 1, 22),
    });

    // Savings contribution
    transactions.push({
      type: 'EXPENSE',
      amountCents: 200000, // R2,000.00
      category: 'Savings',
      description: 'Monthly savings',
      date: new Date(year, monthNum - 1, 28),
    });

    // Add some variety for different months
    if (month === '2026-08') {
      // Holiday in August
      transactions.push({
        type: 'EXPENSE',
        amountCents: 450000, // R4,500.00
        category: 'Travel',
        description: 'Holiday accommodation',
        date: new Date(2026, 7, 15),
      });
      transactions.push({
        type: 'EXPENSE',
        amountCents: 120000, // R1,200.00
        category: 'Travel',
        description: 'Holiday flights',
        date: new Date(2026, 7, 15),
      });
    }

    if (month === '2026-10') {
      // Freelance income in October
      transactions.push({
        type: 'INCOME',
        amountCents: 150000, // R1,500.00
        category: 'Freelance',
        description: 'Web design project',
        date: new Date(2026, 9, 5),
      });
    }
  }

  // Sort transactions by date
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  await prisma.user.upsert({
    where: { email: 'demo@aurelane.app' },
    update: {},
    create: {
      email: 'demo@aurelane.app',
      name: 'Alex',
      passwordHash,
      transactions: {
        create: transactions,
      },
      budgets: {
        create: [
          // Groceries budget
          { category: 'Groceries', monthlyLimitCents: 200000, month: new Date('2026-06-01') },
          { category: 'Groceries', monthlyLimitCents: 200000, month: new Date('2026-07-01') },
          { category: 'Groceries', monthlyLimitCents: 200000, month: new Date('2026-08-01') },
          { category: 'Groceries', monthlyLimitCents: 200000, month: new Date('2026-09-01') },
          { category: 'Groceries', monthlyLimitCents: 200000, month: new Date('2026-10-01') },
          { category: 'Groceries', monthlyLimitCents: 200000, month: new Date('2026-11-01') },
          // Transport budget
          { category: 'Transport', monthlyLimitCents: 300000, month: new Date('2026-06-01') },
          { category: 'Transport', monthlyLimitCents: 300000, month: new Date('2026-07-01') },
          { category: 'Transport', monthlyLimitCents: 300000, month: new Date('2026-08-01') },
          { category: 'Transport', monthlyLimitCents: 300000, month: new Date('2026-09-01') },
          { category: 'Transport', monthlyLimitCents: 300000, month: new Date('2026-10-01') },
          { category: 'Transport', monthlyLimitCents: 300000, month: new Date('2026-11-01') },
          // Dining budget
          { category: 'Dining', monthlyLimitCents: 150000, month: new Date('2026-06-01') },
          { category: 'Dining', monthlyLimitCents: 150000, month: new Date('2026-07-01') },
          { category: 'Dining', monthlyLimitCents: 150000, month: new Date('2026-08-01') },
          { category: 'Dining', monthlyLimitCents: 150000, month: new Date('2026-09-01') },
          { category: 'Dining', monthlyLimitCents: 150000, month: new Date('2026-10-01') },
          { category: 'Dining', monthlyLimitCents: 150000, month: new Date('2026-11-01') },
          // Entertainment budget
          { category: 'Entertainment', monthlyLimitCents: 50000, month: new Date('2026-06-01') },
          { category: 'Entertainment', monthlyLimitCents: 50000, month: new Date('2026-07-01') },
          { category: 'Entertainment', monthlyLimitCents: 50000, month: new Date('2026-08-01') },
          { category: 'Entertainment', monthlyLimitCents: 50000, month: new Date('2026-09-01') },
          { category: 'Entertainment', monthlyLimitCents: 50000, month: new Date('2026-10-01') },
          { category: 'Entertainment', monthlyLimitCents: 50000, month: new Date('2026-11-01') },
          // Savings budget
          { category: 'Savings', monthlyLimitCents: 250000, month: new Date('2026-06-01') },
          { category: 'Savings', monthlyLimitCents: 250000, month: new Date('2026-07-01') },
          { category: 'Savings', monthlyLimitCents: 250000, month: new Date('2026-08-01') },
          { category: 'Savings', monthlyLimitCents: 250000, month: new Date('2026-09-01') },
          { category: 'Savings', monthlyLimitCents: 250000, month: new Date('2026-10-01') },
          { category: 'Savings', monthlyLimitCents: 250000, month: new Date('2026-11-01') },
        ],
      },
      savingsGoals: {
        create: [
          {
            name: 'Emergency Fund',
            targetCents: 10000000, // R100,000.00
            savedCents: 6500000, // R65,000.00
            targetDate: new Date('2027-12-31'),
          },
          {
            name: 'Vacation to Cape Town',
            targetCents: 3000000, // R30,000.00
            savedCents: 1800000, // R18,000.00
            targetDate: new Date('2027-03-31'),
          },
          {
            name: 'New Laptop',
            targetCents: 2500000, // R25,000.00
            savedCents: 800000, // R8,000.00
            targetDate: new Date('2027-06-30'),
          },
        ],
      },
    },
  });

  console.log('Seed data created. Demo user: demo@aurelane.app / demo123');
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
