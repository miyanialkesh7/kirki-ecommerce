import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_ANALYTICS_PARAMS } from '@/features/analytics/lib/url-state';
import { useAnalyticsOverviewQuery } from '@/features/analytics/services/analytics';
import { server } from '@/tests/msw/server';

import { buildOverview } from '../fixtures';

const ENDPOINT = 'https://example.test/wp-json/kirki/ecommerce/v1/analytics/overview';

const createClient = () => {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
};

const createWrapper = (client: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe('useAnalyticsOverviewQuery', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('sends the default controls as the query string and parses the response', async () => {
    let requested: URL | null = null;
    server.use(
      http.get(ENDPOINT, ({ request }) => {
        requested = new URL(request.url);
        return HttpResponse.json({ success: true, message: '', data: buildOverview() });
      }),
    );
    const client = createClient();

    const { result } = renderHook(() => useAnalyticsOverviewQuery(DEFAULT_ANALYTICS_PARAMS), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requested!.searchParams.get('range')).toBe('last_30');
    expect(requested!.searchParams.get('compare')).toBe('previous_period');
    expect(requested!.searchParams.has('currency')).toBe(false);
    expect(result.current.data?.kpis?.orders.current).toBe(12);
  });

  it('sends the custom dates and the currency when they are set', async () => {
    let requested: URL | null = null;
    server.use(
      http.get(ENDPOINT, ({ request }) => {
        requested = new URL(request.url);
        return HttpResponse.json({ success: true, message: '', data: buildOverview() });
      }),
    );
    const client = createClient();
    const params = {
      ...DEFAULT_ANALYTICS_PARAMS,
      range: 'custom',
      from: '2026-09-01',
      to: '2026-09-30',
      compare: 'none',
      currency: 'EUR',
    } as const;

    const { result } = renderHook(() => useAnalyticsOverviewQuery(params), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requested!.searchParams.get('range')).toBe('custom');
    expect(requested!.searchParams.get('from')).toBe('2026-09-01');
    expect(requested!.searchParams.get('to')).toBe('2026-09-30');
    expect(requested!.searchParams.get('compare')).toBe('none');
    expect(requested!.searchParams.get('currency')).toBe('EUR');
  });

  it('keeps a separate cache entry for every selection', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json({ success: true, message: '', data: buildOverview() }),
      ),
    );
    const client = createClient();
    const wrapper = createWrapper(client);

    const first = renderHook(() => useAnalyticsOverviewQuery(DEFAULT_ANALYTICS_PARAMS), {
      wrapper,
    });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    const second = renderHook(
      () => useAnalyticsOverviewQuery({ ...DEFAULT_ANALYTICS_PARAMS, range: 'last_7' }),
      {
        wrapper,
      },
    );
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

    expect(client.getQueryCache().getAll()).toHaveLength(2);
  });

  // Scenario: First visit (no preparation step, so no polling)
  it('does not poll: one request per change of the controls', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json({
          success: true,
          message: '',
          data: { preparing: false, ...buildOverview() },
        }),
      ),
    );
    const client = createClient();

    const { result } = renderHook(() => useAnalyticsOverviewQuery(DEFAULT_ANALYTICS_PARAMS), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const query = client.getQueryCache().getAll()[0];
    expect(query.observers[0].options.refetchInterval).toBeUndefined();
  });
});
