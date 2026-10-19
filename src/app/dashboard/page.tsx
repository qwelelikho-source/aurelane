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

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Total Income</h2>
          <p className="text-3xl font-serif text-green-400 tabular-nums">
            {formatZAR(totals.totalIncome)}
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Total Expenses</h2>
          <p className="text-3xl font-serif text-red-400 tabular-nums">
            {formatZAR(totals.totalExpenses)}
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-sm font-medium text-slate-400 mb-2">Remaining</h2>
          <p
            className={`text-3xl font-serif tabular-nums ${
              totals.remaining >= 0 ? 'text-amber-400' : 'text-red-400'
            }`}
          >
            {formatZAR(totals.remaining)}
          </p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-serif text-white mb-4">Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <p className="text-slate-400">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{transaction.category}</p>
                  <p className="text-sm text-slate-400">
                    {transaction.description || 'No description'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(transaction.date).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <p
                  className={`text-lg font-medium tabular-nums ${
                    transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
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
