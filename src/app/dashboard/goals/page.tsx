'use client';

import { useState, useEffect, useTransition } from 'react';
import { formatZAR } from '@/lib/money';
import { Trash2, Edit2, Plus, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  targetCents: number;
  savedCents: number;
  targetDate: string | null;
  remainingCents: number;
  percentage: number;
  monthlyNeededCents: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetCents: '',
    savedCents: '',
    targetDate: '',
  });
  const [contributeAmount, setContributeAmount] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (!response.ok) throw new Error('Failed to fetch goals');
      const data = await response.json();
      setGoals(data);
    } catch {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchGoals();
    };
    load();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.targetCents || isNaN(Number(formData.targetCents)) || Number(formData.targetCents) <= 0) {
      errors.targetCents = 'Please enter a valid target';
    }

    if (formData.savedCents && (isNaN(Number(formData.savedCents)) || Number(formData.savedCents) < 0)) {
      errors.savedCents = 'Saved amount must be non-negative';
    }

    if (formData.targetDate) {
      const date = new Date(formData.targetDate);
      if (isNaN(date.getTime())) {
        errors.targetDate = 'Invalid date';
      }
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
        const url = editingGoal
          ? `/api/goals/${editingGoal.id}`
          : '/api/goals';
        const method = editingGoal ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            targetCents: Number(formData.targetCents),
            savedCents: Number(formData.savedCents) || 0,
            targetDate: formData.targetDate || null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'VALIDATION' && data.fields) {
            setFormErrors(data.fields);
            setError('Please fix the errors below');
          } else {
            setError(data.error || data.message || 'Failed to save goal');
          }
          return;
        }

        setFormData({ name: '', targetCents: '', savedCents: '', targetDate: '' });
        setFormErrors({});
        setShowForm(false);
        setEditingGoal(null);
        await fetchGoals();
        setToastMessage(editingGoal ? 'Goal updated' : 'Goal created');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save goal');
      }
    });
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contributingGoal) return;

    const amount = Number(contributeAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/goals/${contributingGoal.id}/contribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountCents: Math.round(amount * 100) }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || data.message || 'Failed to contribute');
          return;
        }

        setContributeAmount('');
        setShowContributeModal(false);
        setContributingGoal(null);
        await fetchGoals();
        setToastMessage('Contribution added');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to contribute');
      }
    });
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetCents: String(goal.targetCents),
      savedCents: String(goal.savedCents),
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/goals/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete goal');
        }

        await fetchGoals();
        setToastMessage('Goal deleted');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch {
        setError('Failed to delete goal');
      }
    });
  };

  const openForm = () => {
    setEditingGoal(null);
    setFormData({ name: '', targetCents: '', savedCents: '', targetDate: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({ name: '', targetCents: '', savedCents: '', targetDate: '' });
    setFormErrors({});
  };

  const openContributeModal = (goal: Goal) => {
    setContributingGoal(goal);
    setContributeAmount('');
    setShowContributeModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-text mb-8">Savings Goals</h1>

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
          <h2 className="text-xl font-serif text-text">Your Goals</h2>
          <button
            onClick={openForm}
            className="flex items-center gap-2 h-10 bg-gold hover:bg-gold/90 text-background font-medium px-4 rounded transition-colors text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        {showForm && (
          <div className="bg-background border border-border rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-serif text-text mb-4">
              {editingGoal ? 'Edit Goal' : 'Create Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                  Goal Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold text-[14px] ${
                    formErrors.name ? 'border-negative' : 'border-border'
                  }`}
                  placeholder="e.g., Emergency Fund"
                />
                {formErrors.name && <p className="text-negative text-sm mt-1 text-[13px]">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="targetCents" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                    Target (R)
                  </label>
                  <input
                    id="targetCents"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.targetCents}
                    onChange={(e) => setFormData({ ...formData, targetCents: e.target.value })}
                    className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold text-[14px] ${
                      formErrors.targetCents ? 'border-negative' : 'border-border'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.targetCents && <p className="text-negative text-sm mt-1 text-[13px]">{formErrors.targetCents}</p>}
                </div>

                <div>
                  <label htmlFor="savedCents" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                    Already Saved (R)
                  </label>
                  <input
                    id="savedCents"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.savedCents}
                    onChange={(e) => setFormData({ ...formData, savedCents: e.target.value })}
                    className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold text-[14px] ${
                      formErrors.savedCents ? 'border-negative' : 'border-border'
                    }`}
                    placeholder="0.00"
                  />
                  {formErrors.savedCents && <p className="text-negative text-sm mt-1 text-[13px]">{formErrors.savedCents}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                  Target Date (optional)
                </label>
                <input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className={`w-full h-10 px-4 py-2 bg-background border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold text-[14px] ${
                    formErrors.targetDate ? 'border-negative' : 'border-border'
                  }`}
                />
                {formErrors.targetDate && <p className="text-negative text-sm mt-1 text-[13px]">{formErrors.targetDate}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 bg-gold hover:bg-gold/90 text-background font-medium px-6 rounded transition-colors disabled:opacity-50 text-[14px]"
                >
                  {isPending ? 'Saving...' : editingGoal ? 'Update' : 'Create'}
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
              <div key={i} className="h-24 bg-background rounded animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4 text-[14px]">No savings goals yet.</p>
            <p className="text-sm text-muted text-[13px]">
              Create a goal to track your savings progress.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-background border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-text font-medium text-[14px] mb-1">{goal.name}</h3>
                    <p className="text-sm text-muted text-[13px]">
                      {formatZAR(goal.savedCents)} of {formatZAR(goal.targetCents)} saved
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-muted hover:text-text transition-colors"
                      aria-label="Edit goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-muted hover:text-negative transition-colors"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gold transition-all duration-500 ease-out"
                    style={{ width: `${goal.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gold text-[13px]">{goal.percentage.toFixed(1)}%</span>
                  <span className={`text-[13px] ${
                    goal.remainingCents >= 0 ? 'text-positive' : 'text-negative'
                  }`}>
                    {formatZAR(goal.remainingCents)} remaining
                  </span>
                </div>

                {goal.targetDate && goal.monthlyNeededCents > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted text-[13px] mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      Save {formatZAR(goal.monthlyNeededCents)}/month to reach target
                    </span>
                  </div>
                )}

                <button
                  onClick={() => openContributeModal(goal)}
                  className="w-full h-10 bg-surface hover:bg-surface/80 text-text font-medium px-4 rounded border border-border transition-colors text-[14px]"
                >
                  Contribute
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showContributeModal && contributingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-serif text-text mb-4">Contribute to {contributingGoal.name}</h2>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label htmlFor="contributeAmount" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                  Amount (R)
                </label>
                <input
                  id="contributeAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold text-[14px]"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 bg-gold hover:bg-gold/90 text-background font-medium px-6 rounded transition-colors disabled:opacity-50 text-[14px]"
                >
                  {isPending ? 'Adding...' : 'Add Contribution'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowContributeModal(false);
                    setContributingGoal(null);
                    setContributeAmount('');
                  }}
                  className="flex-1 h-10 bg-background hover:bg-background/80 text-text font-medium px-6 rounded border border-border transition-colors text-[14px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
