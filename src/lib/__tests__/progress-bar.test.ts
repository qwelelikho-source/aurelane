import { describe, it, expect } from 'vitest';

describe('Progress bar colour thresholds', () => {
  it('returns gold colour for spent percentage under 80%', () => {
    const spentPercentage = 50;
    const progressColor = spentPercentage < 80
      ? 'bg-[#C9A24B]'
      : spentPercentage <= 100
      ? 'bg-[#E6A730]'
      : 'bg-[#D9746B]';
    expect(progressColor).toBe('bg-[#C9A24B]');
  });

  it('returns amber colour for spent percentage 80-100%', () => {
    const spentPercentage = 85;
    const progressColor = spentPercentage < 80
      ? 'bg-[#C9A24B]'
      : spentPercentage <= 100
      ? 'bg-[#E6A730]'
      : 'bg-[#D9746B]';
    expect(progressColor).toBe('bg-[#E6A730]');
  });

  it('returns amber colour for exactly 80%', () => {
    const spentPercentage = 80;
    const progressColor = spentPercentage < 80
      ? 'bg-[#C9A24B]'
      : spentPercentage <= 100
      ? 'bg-[#E6A730]'
      : 'bg-[#D9746B]';
    expect(progressColor).toBe('bg-[#E6A730]');
  });

  it('returns amber colour for exactly 100%', () => {
    const spentPercentage = 100;
    const progressColor = spentPercentage < 80
      ? 'bg-[#C9A24B]'
      : spentPercentage <= 100
      ? 'bg-[#E6A730]'
      : 'bg-[#D9746B]';
    expect(progressColor).toBe('bg-[#E6A730]');
  });

  it('returns red colour for spent percentage above 100%', () => {
    const spentPercentage = 120;
    const progressColor = spentPercentage < 80
      ? 'bg-[#C9A24B]'
      : spentPercentage <= 100
      ? 'bg-[#E6A730]'
      : 'bg-[#D9746B]';
    expect(progressColor).toBe('bg-[#D9746B]');
  });

  it('handles zero percentage', () => {
    const spentPercentage = 0;
    const progressColor = spentPercentage < 80
      ? 'bg-[#C9A24B]'
      : spentPercentage <= 100
      ? 'bg-[#E6A730]'
      : 'bg-[#D9746B]';
    expect(progressColor).toBe('bg-[#C9A24B]');
  });
});
