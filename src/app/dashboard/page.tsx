import { auth } from '@/lib/auth';
import { getMonthlyTotals, getRecentTransactions } from '@/lib/data/transactions';
import { formatZAR } from '@/lib/money';
import { getCategoryColor } from '@/lib/categories';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const hour = now.getHours();

  // Time-based greeting
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const userName = session?.user?.name?.split(' ')[0] || 'there';

  const [totals, recentTransactions] = await Promise.all([
    getMonthlyTotals(userId, currentYear, currentMonth),
    getRecentTransactions(userId, 5),
  ]);

  const spentPercentage = totals.totalIncome > 0
    ? (totals.totalExpenses / totals.totalIncome) * 100
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#E8E4DA]">
          {greeting}, {userName}
        </h1>
        <p className="text-[#8B95A8] text-[14px] mt-1">Here&apos;s your financial overview</p>
      </div>

      {/* Hero: Money Remaining */}
      <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-8 mb-8">
        <h2 className="text-sm font-medium text-[#8B95A8] mb-4">Money Remaining</h2>
        <div className="flex items-end gap-4 mb-4">
          <p
            className={`text-6xl font-serif tabular-nums privacy-sensitive ${
              totals.remaining > 0 ? 'text-[#5FB48A]' : totals.remaining < 0 ? 'text-[#D9746B]' : 'text-[#E8E4DA]'
            }`}
          >
            {formatZAR(totals.remaining)}
          </p>
        </div>
        <div className="w-full h-2 bg-[#243049] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D9746B] transition-all duration-500 ease-out"
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-[#8B95A8] mt-2">
          {totals.totalIncome > 0
            ? `${spentPercentage.toFixed(1)}% of income spent this month`
            : 'No income recorded this month'}
        </p>
      </div>

      {/* Smaller figures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
          <h2 className="text-sm font-medium text-[#8B95A8] mb-2">Total Income</h2>
          <p className={`text-2xl font-serif tabular-nums privacy-sensitive ${
            totals.totalIncome > 0 ? 'text-[#5FB48A]' : 'text-[#E8E4DA]'
          }`}>
            {formatZAR(totals.totalIncome)}
          </p>
        </div>

        <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
          <h2 className="text-sm font-medium text-[#8B95A8] mb-2">Total Expenses</h2>
          <p className={`text-2xl font-serif tabular-nums privacy-sensitive ${
            totals.totalExpenses > 0 ? 'text-[#D9746B]' : 'text-[#E8E4DA]'
          }`}>
            {formatZAR(totals.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
        <h2 className="text-xl font-serif text-[#E8E4DA] mb-4">Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8B95A8] mb-4">No transactions yet.</p>
            <a
              href="/dashboard/transactions"
              className="inline-block px-4 py-2 bg-[#C9A24B] text-[#0B1220] font-medium rounded hover:bg-[#B8923E] transition-colors"
            >
              Add your first transaction
            </a>
          </div>
        ) : (
          <div className="divide-y divide-[#243049]">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(transaction.category) }}
                  />
                  <div>
                    <p className="text-[#E8E4DA] font-medium text-[14px]">{transaction.category}</p>
                    <p className="text-sm text-[#8B95A8] text-[13px]">
                      {transaction.description || 'No description'}
                    </p>
                    <p className="text-xs text-[#8B95A8] text-[13px]">
                      {new Date(transaction.date).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-lg font-medium tabular-nums privacy-sensitive ${
                    transaction.type === 'INCOME' && transaction.amountCents > 0
                      ? 'text-[#5FB48A]'
                      : transaction.type === 'EXPENSE' && transaction.amountCents > 0
                      ? 'text-[#D9746B]'
                      : 'text-[#E8E4DA]'
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
