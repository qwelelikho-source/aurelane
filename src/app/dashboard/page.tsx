import { auth } from '@/lib/auth';
import { getMonthlyTotals, getRecentTransactions } from '@/lib/data/transactions';
import { formatZAR } from '@/lib/money';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [totals, recentTransactions] = await Promise.all([
    getMonthlyTotals(userId, currentYear, currentMonth),
    getRecentTransactions(userId, 5),
  ]);

  const spentPercentage = totals.totalIncome > 0
    ? (totals.totalExpenses / totals.totalIncome) * 100
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-text">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm text-muted hover:text-text border border-border rounded hover:bg-surface transition-colors">
            ← Previous
          </button>
          <span className="text-sm text-muted">
            {now.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
          </span>
          <button className="px-3 py-1.5 text-sm text-muted hover:text-text border border-border rounded hover:bg-surface transition-colors">
            Next →
          </button>
        </div>
      </div>

      {/* Hero: Money Remaining */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-8">
        <h2 className="text-sm font-medium text-muted mb-4">Money Remaining</h2>
        <div className="flex items-end gap-4 mb-4">
          <p
            className={`text-6xl font-serif tabular-nums ${
              totals.remaining >= 0 ? 'text-positive' : 'text-negative'
            }`}
          >
            {formatZAR(totals.remaining)}
          </p>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-negative transition-all duration-500 ease-out"
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-2">
          {spentPercentage.toFixed(1)}% of income spent this month
        </p>
      </div>

      {/* Smaller figures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-sm font-medium text-muted mb-2">Total Income</h2>
          <p className="text-2xl font-serif text-positive tabular-nums">
            {formatZAR(totals.totalIncome)}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text font-medium text-muted mb-2">Total Expenses</h2>
          <p className="text-2xl font-serif text-negative tabular-nums">
            {formatZAR(totals.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-xl font-serif text-text mb-4">Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">No transactions yet.</p>
            <a
              href="/dashboard/transactions"
              className="inline-block px-4 py-2 bg-gold text-background font-medium rounded hover:bg-gold/90 transition-colors"
            >
              Add your first transaction
            </a>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex-1">
                  <p className="text-text font-medium">{transaction.category}</p>
                  <p className="text-sm text-muted">
                    {transaction.description || 'No description'}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(transaction.date).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <p
                  className={`text-lg font-medium tabular-nums ${
                    transaction.type === 'INCOME' ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {transaction.type === 'INCOME' ? '+' : '-'}
                  {formatZAR(transaction.amountCents)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
