# Aurelane

Private money tracking, in rand.

Aurelane is a personal finance tracker built for South African rand (ZAR). Track your income, expenses, and manage your finances with a clean, private interface.

## Tech Stack

- **Next.js** (App Router) with TypeScript (strict mode)
- **Tailwind CSS** for styling
- **PostgreSQL** (Neon) for the database
- **Prisma** as the ORM
- **Zod** for runtime validation
- **Auth.js** (credentials provider) with bcryptjs for password hashing
- **Vitest** for testing

## Local Setup

### Prerequisites

- Node.js 18+
- pnpm (package manager)
- A Neon PostgreSQL database account

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd aurelane
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Copy the example environment file:

**PowerShell:**
```powershell
Copy-Item .env.example .env
```

**Bash:**
```bash
cp .env.example .env
```

Then fill in the values in `.env`:

- **DATABASE_URL**: Get from Neon dashboard → Project Settings → Connection Details → **Pooled** connection string
- **DIRECT_URL**: Get from Neon dashboard → Project Settings → Connection Details → **Direct** connection string
- **AUTH_SECRET**: Generate with `npx auth secret` or `openssl rand -base64 32`

4. Run database migrations:

```bash
pnpm prisma migrate deploy
```

5. Seed the database with sample data:

```bash
pnpm prisma db seed
```

This creates a demo user with email `demo@aurelane.com` and password `demo123`, along with sample transactions, budgets, and savings goals. Note: All amounts are SAMPLE FIGURES for demonstration purposes only.

6. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run Vitest tests
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run Prisma migrations
- `pnpm prisma:seed` - Seed the database with sample data

## Features

### Core Features
- **Authentication**: Secure registration and login with bcrypt-hashed passwords
- **Dashboard**: View total income, expenses, and remaining budget for the current month with a hero display and progress bar
- **Transactions**: Add, view, edit, and delete income and expense transactions with inline validation
- **Data Security**: All database operations are scoped by user ID - users can only access their own data
- **South African Rand**: Full ZAR support with proper formatting (R 1 234,56)
- **Responsive Design**: Works on desktop and mobile devices with a mobile bottom navigation bar

### Week 2 Features
- **Budgets**: Create, edit, and delete monthly spending limits per category with visual progress bars showing spent vs limit
- **Savings Goals**: Create, edit, and delete savings goals with progress tracking, target dates, and contribution functionality
- **Charts**: Visual spending patterns with Recharts:
  - Spending by category (horizontal bar chart)
  - Income vs expenses by month (last 6 months)
  - Accessible data tables as text alternatives
- **Filters**: URL-based filtering by month, custom date range, category, and transaction type
- **CSV Export**: Export transactions to CSV with proper escaping, formula injection guard, and UTF-8 BOM for Excel compatibility

## Security

- All monetary values are stored as integer cents (R25.50 = 2550) to avoid floating-point precision issues
- User passwords are hashed with bcrypt before storage
- Every server action validates the user's session and scopes database queries by userId
- Comprehensive ownership tests ensure users cannot access other users' data

## Testing

The project includes unit tests for:

- Money parsing and formatting utilities
- Monthly totals calculation
- Transaction creation validation
- Ownership security (proving users cannot access other users' data)

Run tests with:

```bash
pnpm test
```

## License

MIT
