'use client';

import { useState, useTransition, useEffect } from 'react';
import { formatZAR } from '@/lib/money';
import { Trash2, Edit2, Download } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, getCategoryColor } from '@/lib/categories';

function getRelativeDate(date: string): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const transactionDate = new Date(date);
  const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());

  if (transactionDay.getTime() === today.getTime()) {
    return 'Today';
  }
  if (transactionDay.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  return transactionDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

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
    category: EXPENSE_CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState({
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    category: '',
    description: '',
    date: '',
  });
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

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

    if (!formData.category) {
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const categories = transaction.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setEditFormData({
      type: transaction.type,
      amount: String(transaction.amountCents / 100),
      category: categories.includes(transaction.category) ? transaction.category : categories[0],
      description: transaction.description || '',
      date: transaction.date.slice(0, 10),
    });
    setEditFormErrors({});
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEditFormErrors({});

    if (!editingTransaction) return;

    if (!editFormData.amount || isNaN(Number(editFormData.amount)) || Number(editFormData.amount) <= 0) {
      setEditFormErrors({ amount: 'Please enter a valid amount' });
      return;
    }

    if (!editFormData.category.trim()) {
      setEditFormErrors({ category: 'Category is required' });
      return;
    }

    if (!editFormData.date) {
      setEditFormErrors({ date: 'Date is required' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: editFormData.type,
            amount: editFormData.amount,
            category: editFormData.category,
            description: editFormData.description || null,
            date: editFormData.date,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'VALIDATION' && data.fields) {
            setEditFormErrors(data.fields);
            setError('Please fix the errors below');
          } else {
            setError(data.message || data.error || 'Failed to update transaction');
          }
          return;
        }

        setShowEditForm(false);
        setEditingTransaction(null);
        await fetchTransactions();
        setToastMessage('Transaction updated');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update transaction');
      }
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/transactions/export');
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to export transactions');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-[#E8E4DA] mb-8">Transactions</h1>

      {showToast && (
        <div className="fixed top-4 right-4 bg-[#5FB48A] text-[#0B1220] px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      {error && (
        <div className="bg-[#D9746B]/10 border border-[#D9746B] text-[#D9746B] px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-serif text-[#E8E4DA] mb-4">Add Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE', category: e.target.value === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] })}
                className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px]"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                Amount (R)
              </label>
              <input
                id="amount"
                type="text"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px] ${
                  formErrors.amount ? 'border-[#D9746B]' : 'border-[#243049]'
                }`}
                placeholder="0.00"
              />
              {formErrors.amount && <p className="text-[#D9746B] text-sm mt-1 text-[13px]">{formErrors.amount}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px] ${
                  formErrors.category ? 'border-[#D9746B]' : 'border-[#243049]'
                }`}
              >
                {(formData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {formErrors.category && <p className="text-[#D9746B] text-sm mt-1 text-[13px]">{formErrors.category}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px] ${
                  formErrors.date ? 'border-[#D9746B]' : 'border-[#243049]'
                }`}
              />
              {formErrors.date && <p className="text-[#D9746B] text-sm mt-1 text-[13px]">{formErrors.date}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
              Description (optional)
            </label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px]"
              placeholder="e.g., Weekly grocery shopping"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="h-10 bg-[#C9A24B] hover:bg-[#B8923E] text-[#0B1220] font-medium px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
          >
            {isPending ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>

      <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-[#E8E4DA]">All Transactions</h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 h-10 bg-[#121B2D] hover:bg-[#1A263D] text-[#E8E4DA] font-medium px-4 rounded border border-[#243049] transition-colors text-[14px]"
            aria-label="Export transactions"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#0B1220] rounded animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8B95A8] mb-4 text-[14px]">No transactions yet.</p>
            <p className="text-sm text-[#8B95A8] text-[13px]">
              Add your first transaction using the form above.
            </p>
          </div>
        ) : (
          <>
            {showEditForm && editingTransaction && (
              <div className="bg-[#0B1220] border border-[#243049] rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-serif text-[#E8E4DA] mb-4">Edit Transaction</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-type" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                        Type
                      </label>
                      <select
                        id="edit-type"
                        value={editFormData.type}
                        onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as 'INCOME' | 'EXPENSE', category: e.target.value === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] })}
                        className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] text-[14px]"
                      >
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="edit-amount" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                        Amount (R)
                      </label>
                      <input
                        id="edit-amount"
                        type="text"
                        step="0.01"
                        value={editFormData.amount}
                        onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                        className={`w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] text-[14px] ${
                          editFormErrors.amount ? 'border-[#D9746B]' : 'border-[#243049]'
                        }`}
                        placeholder="0.00"
                      />
                      {editFormErrors.amount && <p className="text-[#D9746B] text-sm mt-1 text-[13px]">{editFormErrors.amount}</p>}
                    </div>

                    <div>
                      <label htmlFor="edit-category" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                        Category
                      </label>
                      <select
                        id="edit-category"
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className={`w-full h-10 px-4 py-2 bg-background border rounded text-text focus:outline-none focus:ring-2 focus:ring-gold text-[14px] ${
                          editFormErrors.category ? 'border-negative' : 'border-border'
                        }`}
                      >
                        {(editFormData.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {editFormErrors.category && <p className="text-[#D9746B] text-sm mt-1 text-[13px]">{editFormErrors.category}</p>}
                    </div>

                    <div>
                      <label htmlFor="edit-date" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                        Date
                      </label>
                      <input
                        id="edit-date"
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        className={`w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] text-[14px] ${
                          editFormErrors.date ? 'border-[#D9746B]' : 'border-[#243049]'
                        }`}
                      />
                      {editFormErrors.date && <p className="text-[#D9746B] text-sm mt-1 text-[13px]">{editFormErrors.date}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                      Description (optional)
                    </label>
                    <input
                      id="edit-description"
                      type="text"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] text-[14px]"
                      placeholder="e.g., Weekly grocery shopping"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-10 bg-[#C9A24B] hover:bg-[#B8923E] text-[#0B1220] font-medium px-6 rounded transition-colors disabled:opacity-50 text-[14px]"
                    >
                      {isPending ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingTransaction(null);
                      }}
                      className="h-10 bg-[#121B2D] hover:bg-[#1A263D] text-[#E8E4DA] font-medium px-6 rounded border border-[#243049] transition-colors text-[14px]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="divide-y divide-[#243049]">
              {transactions.map((transaction) => (
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
                      {transaction.description && (
                        <p className="text-sm text-[#8B95A8] text-[13px]">{transaction.description}</p>
                      )}
                      <p className="text-xs text-[#8B95A8] text-[13px]">
                        {getRelativeDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`text-lg font-medium tabular-nums ${
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
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-[#8B95A8] hover:text-[#E8E4DA] transition-colors disabled:opacity-50"
                      disabled={isPending}
                      aria-label="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-[#8B95A8] hover:text-[#D9746B] transition-colors disabled:opacity-50"
                      disabled={isPending}
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
