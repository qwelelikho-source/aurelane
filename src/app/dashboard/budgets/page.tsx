'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { formatZAR } from '@/lib/money';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  monthlyLimitCents: number;
  month: string;
  spentCents: number;
  remainingCents: number;
  percentage: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formData, setFormData] = useState({
    category: '',
    monthlyLimitCents: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch(`/api/budgets?month=${selectedMonth}`);
      if (!response.ok) throw new Error('Failed to fetch budgets');
      const data = await response.json();
      setBudgets(data);
    } catch {
      setError('Failed to load budgets');
    }
  }, [selectedMonth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchBudgets().finally(() => setLoading(false));
  }, [fetchBudgets]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!formData.monthlyLimitCents || isNaN(Number(formData.monthlyLimitCents)) || Number(formData.monthlyLimitCents) <= 0) {
      errors.monthlyLimitCents = 'Please enter a valid limit';
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
        const url = editingBudget
          ? `/api/budgets/${editingBudget.id}`
          : '/api/budgets';
        const method = editingBudget ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            monthlyLimitCents: Number(formData.monthlyLimitCents),
            month: selectedMonth,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'VALIDATION' && data.fields) {
            setFormErrors(data.fields);
            setError('Please fix the errors below');
          } else {
            setError(data.error || data.message || 'Failed to save budget');
          }
          return;
        }

        setFormData({ category: '', monthlyLimitCents: '' });
        setFormErrors({});
        setShowForm(false);
        setEditingBudget(null);
        await fetchBudgets();
        setToastMessage(editingBudget ? 'Budget updated' : 'Budget created');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save budget');
      }
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      monthlyLimitCents: String(budget.monthlyLimitCents),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/budgets/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete budget');
        }

        await fetchBudgets();
        setToastMessage('Budget deleted');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch {
        setError('Failed to delete budget');
      }
    });
  };

  const openForm = () => {
    setEditingBudget(null);
    setFormData({ category: '', monthlyLimitCents: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormData({ category: '', monthlyLimitCents: '' });
    setFormErrors({});
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-text mb-8">Budgets</h1>

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="month" className="text-sm font-medium text-muted text-[14px]">
              Month
            </label>
            <input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 px-4 py-2 bg-background border border-border rounded text-text focus:outline-none focus:ring-2 focus:ring-gold text-[14px]"
            />
          </div>
          <button
            onClick={openForm}
            className="flex items-center gap-2 h-10 bg-gold hover:bg-gold/90 text-background font-medium px-4 rounded transition-colors text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
        </div>

        {showForm && (
          <div className="bg-background border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-serif text-text mb-4">
              {editingBudget ? 'Edit Budget' : 'Create Budget'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold text-[14px] ${
                    formErrors.category ? 'border-negative' : 'border-border'
                  }`}
                  placeholder="e.g., Groceries"
                />
                {formErrors.category && <p className="text-negative text-sm mt-1 text-[13px]">{formErrors.category}</p>}
              </div>

              <div>
                <label htmlFor="monthlyLimitCents" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                  Monthly Limit (R)
                </label>
                <input
                  id="monthlyLimitCents"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.monthlyLimitCents}
                  onChange={(e) => setFormData({ ...formData, monthlyLimitCents: e.target.value })}
                  className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold text-[14px] ${
                    formErrors.monthlyLimitCents ? 'border-negative' : 'border-border'
                  }`}
                  placeholder="0.00"
                />
                {formErrors.monthlyLimitCents && <p className="text-negative text-sm mt-1 text-[13px]">{formErrors.monthlyLimitCents}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 bg-gold hover:bg-gold/90 text-background font-medium px-6 rounded transition-colors disabled:opacity-50 text-[14px]"
                >
                  {isPending ? 'Saving...' : editingBudget ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-10 bg-background hover:bg-background/80 text-text font-medium px-6 rounded border border-border transition-colors text-[14px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-background rounded animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4 text-[14px]">No budgets for this month.</p>
            <p className="text-sm text-muted text-[13px]">
              Add a budget to track your spending limits.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="bg-background border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-text font-medium text-[14px]">{budget.category}</h3>
                    <p className="text-sm text-muted text-[13px]">
                      {formatZAR(budget.spentCents)} of {formatZAR(budget.monthlyLimitCents)} spent
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-muted hover:text-text transition-colors"
                      aria-label="Edit budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-muted hover:text-negative transition-colors"
                      aria-label="Delete budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      budget.percentage < 80 ? 'bg-muted' : budget.percentage < 100 ? 'bg-gold' : 'bg-negative'
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className={`text-[13px] ${
                    budget.percentage < 80 ? 'text-muted' : budget.percentage < 100 ? 'text-gold' : 'text-negative'
                  }`}>
                    {budget.percentage.toFixed(1)}%
                  </span>
                  <span className={`text-[13px] ${
                    budget.remainingCents >= 0 ? 'text-positive' : 'text-negative'
                  }`}>
                    {formatZAR(budget.remainingCents)} remaining
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
