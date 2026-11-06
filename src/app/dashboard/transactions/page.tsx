'use client';

import { useState, useTransition, useEffect } from 'react';
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
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

  useEffect(() => {
    const load = async () => {
      await fetchTransactions();
    };
    load();
  }, []);

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
        setToastMessage('Transaction added successfully');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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
        setToastMessage('Transaction deleted');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch {
        setError('Failed to delete transaction');
      }
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-text mb-8">Transactions</h1>

      {showToast && (
        <div className="fixed top-4 right-4 bg-positive text-background px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {error && (
        <div className="bg-negative/10 border border-negative text-negative px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-serif text-text mb-4">Add Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-muted mb-1">
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                className="w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-muted mb-1">
                Amount (R)
              </label>
              <input
                id="amount"
                type="text"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all ${
                  formErrors.amount ? 'border-negative' : 'border-border'
                }`}
                placeholder="0.00"
              />
              {formErrors.amount && <p className="text-negative text-sm mt-1">{formErrors.amount}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-muted mb-1">
                Category
              </label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all ${
                  formErrors.category ? 'border-negative' : 'border-border'
                }`}
                placeholder="e.g., Groceries"
              />
              {formErrors.category && <p className="text-negative text-sm mt-1">{formErrors.category}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-muted mb-1">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all ${
                  formErrors.date ? 'border-negative' : 'border-border'
                }`}
              />
              {formErrors.date && <p className="text-negative text-sm mt-1">{formErrors.date}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-muted mb-1">
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
              placeholder="e.g., Weekly grocery shopping"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="h-10 bg-gold hover:bg-gold/90 text-background font-medium px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-xl font-serif text-text mb-4">All Transactions</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-background rounded animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">No transactions yet.</p>
            <p className="text-sm text-muted">
              Add your first transaction using the form above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
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
                <div className="flex items-center gap-4">
                  <p
                    className={`text-lg font-medium tabular-nums ${
                      transaction.type === 'INCOME' ? 'text-positive' : 'text-negative'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatZAR(transaction.amountCents)}
                  </p>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-muted hover:text-negative transition-colors disabled:opacity-50"
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
