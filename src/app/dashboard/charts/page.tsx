'use client';

import { useState, useEffect } from 'react';
import { formatZAR } from '@/lib/money';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountCents: number;
  category: string;
  date: string;
}

export default function ChartsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchTransactions();
    };
    load();
  }, []);

  // Prepare spending by category data
  const spendingByCategory = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amountCents;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(spendingByCategory).map(([category, amountCents]) => ({
    category,
    amount: amountCents / 100,
  }));

  // Prepare income vs expenses by month data (last 6 months)
  const monthlyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, income: 0, expenses: 0 };
    }
    
    if (t.type === 'INCOME') {
      acc[monthKey].income += t.amountCents;
    } else {
      acc[monthKey].expenses += t.amountCents;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const monthlyChartData = Object.values(monthlyData)
    .map((d) => ({
      month: d.month,
      income: d.income / 100,
      expenses: d.expenses / 100,
    }))
    .slice(-6);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-text mb-8">Charts</h1>
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-6 h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-text mb-8">Charts</h1>
        <div className="bg-negative/10 border border-negative text-negative px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-text mb-8">Charts</h1>

      {transactions.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <p className="text-muted mb-4 text-[14px]">No transaction data to display charts.</p>
          <p className="text-sm text-muted text-[13px]">
            Add some transactions to see your spending patterns.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Spending by Category */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-xl font-serif text-text mb-6">Spending by Category</h2>
            
            {categoryData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted text-[14px]">No expense transactions yet.</p>
              </div>
            ) : (
              <>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <XAxis 
                        dataKey="category" 
                        stroke="#8B95A8"
                        style={{ fontSize: '13px' }}
                      />
                      <YAxis 
                        stroke="#8B95A8"
                        style={{ fontSize: '13px' }}
                        tickFormatter={(value) => `R${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#121B2D', 
                          border: '1px solid #243049',
                          borderRadius: '10px',
                        }}
                        itemStyle={{ color: '#E8E4DA' }}
                        formatter={(value: number) => [formatZAR(value * 100), 'Amount']}
                      />
                      <Bar dataKey="amount" fill="#C9A24B" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Accessible data table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-[13px]" aria-label="Spending by category breakdown">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-4 text-muted">Category</th>
                        <th className="text-right py-2 px-4 text-muted">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.map((item) => (
                        <tr key={item.category} className="border-b border-border">
                          <td className="py-2 px-4 text-text">{item.category}</td>
                          <td className="py-2 px-4 text-right tabular-nums text-text">
                            {formatZAR(item.amount * 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Income vs Expenses by Month */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-xl font-serif text-text mb-6">Income vs Expenses (Last 6 Months)</h2>
            
            {monthlyChartData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted text-[14px]">No monthly data available.</p>
              </div>
            ) : (
              <>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <XAxis 
                        dataKey="month" 
                        stroke="#8B95A8"
                        style={{ fontSize: '13px' }}
                      />
                      <YAxis 
                        stroke="#8B95A8"
                        style={{ fontSize: '13px' }}
                        tickFormatter={(value) => `R${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#121B2D', 
                          border: '1px solid #243049',
                          borderRadius: '10px',
                        }}
                        itemStyle={{ color: '#E8E4DA' }}
                        formatter={(value: number) => [formatZAR(value * 100), 'Amount']}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#8B95A8', fontSize: '13px' }}
                      />
                      <Bar dataKey="income" fill="#5FB48A" name="Income" radius={[10, 10, 0, 0]} />
                      <Bar dataKey="expenses" fill="#D9746B" name="Expenses" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Accessible data table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-[13px]" aria-label="Income vs expenses by month">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-4 text-muted">Month</th>
                        <th className="text-right py-2 px-4 text-muted">Income</th>
                        <th className="text-right py-2 px-4 text-muted">Expenses</th>
                        <th className="text-right py-2 px-4 text-muted">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyChartData.map((item) => (
                        <tr key={item.month} className="border-b border-border">
                          <td className="py-2 px-4 text-text">{item.month}</td>
                          <td className="py-2 px-4 text-right tabular-nums text-positive">
                            {formatZAR(item.income * 100)}
                          </td>
                          <td className="py-2 px-4 text-right tabular-nums text-negative">
                            {formatZAR(item.expenses * 100)}
                          </td>
                          <td className={`py-2 px-4 text-right tabular-nums ${
                            item.income - item.expenses >= 0 ? 'text-positive' : 'text-negative'
                          }`}>
                            {formatZAR((item.income - item.expenses) * 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
