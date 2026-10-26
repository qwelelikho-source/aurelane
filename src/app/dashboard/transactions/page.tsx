'use client';

import { useState, useTransition } from 'react';
import { formatZAR } from '@/lib/money';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amountCents: number;
  category: string;
  description: string | null;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  useState(() => {
    fetchTransactions();
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormErrors({});

    if (!validateForm()) return;

    startTransition(async () => {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: formData.type,
            amount: formData.amount,
            category: formData.category,
            description: formData.description || null,
            date: formData.date,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'VALIDATION' && data.fields) {
            setFormErrors(data.fields);
            setError('Please fix the errors below');
          } else {
            setError(data.message || data.error || 'Failed to add transaction');
          }
          return;
        }

        setFormData({
          type: 'EXPENSE',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
        setFormErrors({});
        await fetchTransactions();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add transaction');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete transaction');
        }

        await fetchTransactions();
      } catch {
        setError('Failed to delete transaction');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Transactions</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
        <h2 className="text-xl font-serif text-white mb-4">Add Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">
                Amount (R)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-4 py-2 bg-slate-700 border rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  formErrors.amount ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0.00"
              />
              {formErrors.amount && <p className="text-red-400 text-sm mt-1">{formErrors.amount}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
                Category
              </label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-2 bg-slate-700 border rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  formErrors.category ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="e.g., Groceries"
              />
              {formErrors.category && <p className="text-red-400 text-sm mt-1">{formErrors.category}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-2 bg-slate-700 border rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                  formErrors.date ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {formErrors.date && <p className="text-red-400 text-sm mt-1">{formErrors.date}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="e.g., Weekly grocery shopping"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-2 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-serif text-white mb-4">All Transactions</h2>

        {transactions.length === 0 ? (
          <p className="text-slate-400">No transactions yet. Add your first transaction above.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{transaction.category}</p>
                  <p className="text-sm text-slate-400">
                    {transaction.description || 'No description'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(transaction.date).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p
                    className={`text-lg font-medium tabular-nums ${
                      transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatZAR(transaction.amountCents)}
                  </p>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    disabled={isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
