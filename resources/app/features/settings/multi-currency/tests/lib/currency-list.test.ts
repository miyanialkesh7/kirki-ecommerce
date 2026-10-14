import { describe, expect, it, vi } from 'vitest';

import type { CurrencyListItem } from '@/features/settings/multi-currency/lib/currency-list';
import {
  buildCurrencyListItems,
  buildCurrencyUpdatePayload,
  getSyncStatus,
  type SyncStatusInput,
} from '@/features/settings/multi-currency/lib/currency-list';
import type { CurrencyRateItem } from '@/features/settings/multi-currency/schemas/forms/multi-currency-settings-form';

vi.mock('@/wpi18n', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  sprintf: (format: string, ...args: (string | number)[]) => {
    let next = 0;
    return format.replace(/%(?:(\d+)\$)?s/g, (_match, position?: string) =>
      String(position ? args[Number(position) - 1] : args[next++]),
    );
  },
}));

const buildCurrency = (overrides: Partial<CurrencyRateItem> = {}): CurrencyRateItem => ({
  id: 1,
  name: 'US Dollar',
  code: 'USD',
  symbol: '$',
  exchange_rate: 1,
  is_base: false,
  is_active: true,
  ...overrides,
});

describe('buildCurrencyListItems', () => {
  it('disables toggle/actions for the base currency and marks it enabled from is_active', () => {
    const [item] = buildCurrencyListItems([buildCurrency({ is_base: true, is_active: true })]);

    expect(item.is_toggle_disabled).toBe(true);
    expect(item.is_action_disabled).toBe(true);
    expect(item.is_enabled).toBe(true);
  });

  it('carries the symbol as the row icon and mirrors is_active to is_enabled', () => {
    const [item] = buildCurrencyListItems([buildCurrency({ is_active: false })]);

    expect(item.icon).toBe('$');
    expect(item.is_enabled).toBe(false);
  });
});

describe('buildCurrencyUpdatePayload', () => {
  const list: CurrencyListItem[] = [
    { ...buildCurrency({ id: 1, is_active: true, is_base: true }) },
    { ...buildCurrency({ id: 2, is_active: false, is_base: false }) },
  ];

  it('flips a single boolean field on the targeted currency, keeping only currency fields', () => {
    const payload = buildCurrencyUpdatePayload(list, list[1], 'is_active');

    expect(payload).toEqual({
      items: [
        {
          id: 2,
          name: 'US Dollar',
          code: 'USD',
          symbol: '$',
          exchange_rate: 1,
          is_active: true,
          is_base: false,
        },
      ],
    });
  });

  it('sends only the new base row so the server recalculates the other rates', () => {
    const payload = buildCurrencyUpdatePayload(list, list[1], 'is_base');

    expect(payload).toEqual({
      items: [
        {
          id: 2,
          name: 'US Dollar',
          code: 'USD',
          symbol: '$',
          exchange_rate: 1,
          is_base: true,
          is_active: false,
        },
      ],
    });
  });

  it('returns null when the targeted currency is not in the list', () => {
    const missing: CurrencyListItem = { ...buildCurrency({ id: 999 }) };

    expect(buildCurrencyUpdatePayload(list, missing, 'is_active')).toBeNull();
    expect(buildCurrencyUpdatePayload(list, missing, 'is_base')).toBeNull();
  });
});

describe('getSyncStatus', () => {
  const now = new Date(2026, 9, 14, 12, 0, 0);
  const connected: SyncStatusInput = {
    apiProvider: 'exchangerate-api',
    providerName: 'ExchangeRate API',
    hasApiKey: true,
    isAutomaticUpdateEnabled: true,
    lastSyncAt: '2026-10-14 11:58:00',
    nextSyncAt: '2026-10-14 12:58:00',
    lastSyncError: null,
    lastSyncErrorAt: null,
    now,
  };

  it('asks for a provider when none is selected', () => {
    expect(getSyncStatus({ ...connected, apiProvider: '' })).toEqual({
      tone: 'default',
      message: 'Rates are updated manually. Turn on Automatic Updates below and select a provider.',
    });
  });

  it('names the provider and asks for an API key when none is saved', () => {
    expect(getSyncStatus({ ...connected, hasApiKey: false })).toEqual({
      tone: 'default',
      message:
        'ExchangeRate API is not connected. Add an API key below to sync rates automatically.',
    });
  });

  it('shows the last and next sync when automatic updates are on', () => {
    expect(getSyncStatus(connected)).toEqual({
      tone: 'default',
      message: 'Automatic updates on. Last sync 2 minutes ago. Next sync in 58 minutes.',
    });
  });

  it('warns about a failed automatic sync', () => {
    expect(
      getSyncStatus({
        ...connected,
        nextSyncAt: '2026-10-14 12:55:00',
        lastSyncError: 'Invalid API key.',
        lastSyncErrorAt: '2026-10-14 11:55:00',
      }),
    ).toEqual({
      tone: 'warning',
      message:
        'Automatic sync failed 5 minutes ago: Invalid API key. Rates kept. Retry in 55 minutes.',
    });
  });

  it('ends an error without punctuation with a period', () => {
    const status = getSyncStatus({
      ...connected,
      lastSyncError: 'Service unavailable',
      lastSyncErrorAt: null,
      nextSyncAt: null,
    });
    expect(status.message).toBe('Automatic sync failed: Service unavailable. Rates kept.');
  });

  it('suggests Sync now when connected with automatic updates off', () => {
    expect(
      getSyncStatus({
        ...connected,
        isAutomaticUpdateEnabled: false,
        lastSyncAt: '2026-10-14 09:00:00',
        nextSyncAt: null,
      }),
    ).toEqual({
      tone: 'default',
      message:
        'API connected, automatic updates off. Last sync 3 hours ago. Use Sync now to update.',
    });
  });

  it('ignores a recorded error while automatic updates are off', () => {
    const status = getSyncStatus({
      ...connected,
      isAutomaticUpdateEnabled: false,
      lastSyncError: 'Invalid API key.',
    });
    expect(status.tone).toBe('default');
  });

  it('leaves out the times that are empty when no sync has completed', () => {
    expect(getSyncStatus({ ...connected, lastSyncAt: null }).message).toBe(
      'Automatic updates on. Next sync in 58 minutes.',
    );
    expect(getSyncStatus({ ...connected, lastSyncAt: null, nextSyncAt: null }).message).toBe(
      'Automatic updates on.',
    );
  });
});
