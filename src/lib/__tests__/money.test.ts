import { describe, it, expect } from 'vitest';
import { parseRandToCents, formatZAR, sumCents, formatZARCompact } from '../money';

describe('parseRandToCents', () => {
  it('should parse basic rand values with dot separator', () => {
    expect(parseRandToCents('25.50')).toBe(2550);
    expect(parseRandToCents('0.99')).toBe(99);
    expect(parseRandToCents('100.00')).toBe(10000);
  });

  it('should parse rand values with comma separator', () => {
    expect(parseRandToCents('25,50')).toBe(2550);
    expect(parseRandToCents('0,99')).toBe(99);
    expect(parseRandToCents('100,00')).toBe(10000);
  });

  it('should parse rand values with spaces as thousand separators', () => {
    expect(parseRandToCents('1 000.00')).toBe(100000);
    expect(parseRandToCents('10 000.50')).toBe(1000050);
    expect(parseRandToCents('1 000,00')).toBe(100000);
  });

  it('should parse integer values without decimals', () => {
    expect(parseRandToCents('100')).toBe(10000);
    expect(parseRandToCents('50')).toBe(5000);
    expect(parseRandToCents('0')).toBe(0);
  });

  it('should reject non-numeric strings', () => {
    expect(() => parseRandToCents('abc')).toThrow('must be a numeric value');
    expect(() => parseRandToCents('25.50abc')).toThrow('must be a numeric value');
    expect(() => parseRandToCents('')).toThrow('must be a non-empty string');
  });

  it('should reject negative values', () => {
    expect(() => parseRandToCents('-25.50')).toThrow('negative values are not allowed');
    expect(() => parseRandToCents('-100')).toThrow('negative values are not allowed');
  });

  it('should reject values with more than 2 decimal places', () => {
    expect(() => parseRandToCents('25.500')).toThrow('cannot have more than 2 decimal places');
    expect(() => parseRandToCents('25.999')).toThrow('cannot have more than 2 decimal places');
    expect(() => parseRandToCents('25,999')).toThrow('cannot have more than 2 decimal places');
  });

  it('should handle edge cases', () => {
    expect(parseRandToCents('0.01')).toBe(1);
    expect(parseRandToCents('0,01')).toBe(1);
    expect(parseRandToCents('999999.99')).toBe(99999999);
  });
});

describe('formatZAR', () => {
  it('should format cents as ZAR currency', () => {
    expect(formatZAR(2550)).toBe('R\u00A025,50');
    expect(formatZAR(100)).toBe('R\u00A01,00');
    expect(formatZAR(0)).toBe('R\u00A00,00');
    expect(formatZAR(100000)).toBe('R\u00A01\u00A0000,00');
  });

  it('should handle large values', () => {
    expect(formatZAR(10000000)).toBe('R\u00A0100\u00A0000,00');
    expect(formatZAR(99999999)).toBe('R\u00A0999\u00A0999,99');
  });
});

describe('sumCents', () => {
  it('should sum an array of cent values', () => {
    expect(sumCents([100, 200, 300])).toBe(600);
    expect(sumCents([2550, 10000, 500])).toBe(13050);
    expect(sumCents([0, 0, 0])).toBe(0);
  });

  it('should handle empty array', () => {
    expect(sumCents([])).toBe(0);
  });

  it('should handle single value', () => {
    expect(sumCents([5000])).toBe(5000);
  });
});

describe('formatZARCompact', () => {
  it('should format small values normally', () => {
    expect(formatZARCompact(500)).toBe('R\u00A05,00');
    expect(formatZARCompact(99900)).toBe('R\u00A0999,00');
  });

  it('should format large values with k suffix', () => {
    expect(formatZARCompact(100000)).toBe('R\u00A01,0k');
    expect(formatZARCompact(150000)).toBe('R\u00A01,5k');
    expect(formatZARCompact(1000000)).toBe('R\u00A010,0k');
    expect(formatZARCompact(1550000)).toBe('R\u00A015,5k');
  });
});
