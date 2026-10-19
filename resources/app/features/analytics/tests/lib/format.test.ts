import { describe, expect, it } from 'vitest';

import { formatMoney, formatNumber, formatPercent } from '@/features/analytics/lib/format';

import { money } from '../fixtures';

describe('formatMoney', () => {
  it('shows the display string of the money object', () => {
    expect(formatMoney(money(3003))).toBe('$30.03');
  });

  it('keeps the currency of the money object', () => {
    expect(formatMoney(money(9000, 'EUR', '€'))).toBe('€90.00');
  });

  it('shows a dash for an empty value, not zero', () => {
    expect(formatMoney(null)).toBe('—');
  });
});

describe('formatNumber', () => {
  it('groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('shows zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('shows a dash for an empty value', () => {
    expect(formatNumber(null)).toBe('—');
  });
});

describe('formatPercent', () => {
  it('keeps one decimal', () => {
    expect(formatPercent(33.333)).toBe('33.3%');
    expect(formatPercent(100)).toBe('100.0%');
  });

  it('shows a dash for an empty value', () => {
    expect(formatPercent(null)).toBe('—');
  });
});
