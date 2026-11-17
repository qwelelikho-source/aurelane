'use client';

import { useState, useEffect } from 'react';

interface InsightData {
  status: 'on_track' | 'watch' | 'overspending' | 'not_enough_data';
  headline: string;
  observations: string[];
  suggestion: string;
  generatedAt: string;
  cached: boolean;
}

export function InsightsCard() {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const fetchInsight = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const url = forceRefresh ? `/api/insights?month=${currentMonth}&refresh=true` : `/api/insights?month=${currentMonth}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'RATE_LIMITED') {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to load insights');
        }
        return;
      }

      setInsight(data);
    } catch {
      setError('Failed to load insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAiEnabled = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setAiEnabled(data.aiEnabled || false);
      }
    } catch {
      // If endpoint doesn't exist yet, default to false
    }
  };

  const toggleAiEnabled = async () => {
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiEnabled: !aiEnabled }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiEnabled(data.aiEnabled);
        await fetchInsight(true);
      }
    } catch {
      setError('Failed to update settings');
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchInsight();
      await fetchAiEnabled();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-[#5FB48A] text-[#0B1220]';
      case 'watch':
        return 'bg-[#C9A24B] text-[#0B1220]';
      case 'overspending':
        return 'bg-[#D9746B] text-[#0B1220]';
      default:
        return 'bg-[#8B95A8] text-[#0B1220]';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'On Track';
      case 'watch':
        return 'Watch';
      case 'overspending':
        return 'Overspending';
      default:
        return 'Not Enough Data';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#243049] rounded w-1/3" />
          <div className="h-4 bg-[#243049] rounded w-full" />
          <div className="h-4 bg-[#243049] rounded w-3/4" />
          <div className="h-4 bg-[#243049] rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
        <h2 className="text-xl font-serif text-[#E8E4DA] mb-4">Aurelane Insights</h2>
        <p className="text-[#D9746B] text-[14px]">{error}</p>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
        <h2 className="text-xl font-serif text-[#E8E4DA] mb-4">Aurelane Insights</h2>
        <p className="text-[#8B95A8] text-[14px]">No insights available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-serif text-[#E8E4DA] mb-2">Aurelane Insights</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(insight.status)}`}>
            {getStatusLabel(insight.status)}
          </span>
        </div>
        <button
          onClick={() => {
            setRefreshing(true);
            fetchInsight(true);
          }}
          disabled={refreshing}
          className="text-[#8B95A8] hover:text-[#C9A24B] transition-colors disabled:opacity-50"
          aria-label="Refresh insights"
        >
          ↻
        </button>
      </div>

      <h3 className="text-lg font-medium text-[#E8E4DA] mb-3">{insight.headline}</h3>

      <ul className="space-y-2 mb-4">
        {insight.observations.map((obs, index) => (
          <li key={index} className="flex items-start gap-2 text-[#8B95A8] text-[14px]">
            <span className="text-[#C9A24B] mt-1">•</span>
            <span>{obs}</span>
          </li>
        ))}
      </ul>

      <div className="bg-[#0B1220] border border-[#243049] rounded-lg p-4 mb-4">
        <p className="text-[#E8E4DA] text-[14px]">
          <span className="font-medium text-[#C9A24B]">Suggestion:</span> {insight.suggestion}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-[#243049] pt-4">
        <label className="flex items-center gap-2 text-[#8B95A8] text-[14px]">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={toggleAiEnabled}
            className="w-4 h-4 accent-[#C9A24B]"
          />
          <span>Enable AI insights</span>
        </label>
        <p className="text-xs text-[#8B95A8]">
          {insight.cached ? 'Cached' : 'Generated'} • {new Date(insight.generatedAt).toLocaleDateString()}
        </p>
      </div>

      <p className="text-xs text-[#8B95A8] mt-4 pt-4 border-t border-[#243049]">
        General information based on your recorded transactions, not financial advice.
      </p>
    </div>
  );
}
