import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { endpoints } from '@/config/endpoints';
import { useOrderCreate } from '@/features/orders/hooks/use-order-create';
import type { ProductSelection } from '@/features/products';
import type { MoneyObject } from '@/schemas/shared/api';
import { server } from '@/tests/msw/server';

const money = (raw: number): MoneyObject => ({
  raw,
  display: `$${raw}`,
  currency: { code: 'USD', symbol: '$' },
});

const buildCalculationResponse = (
  itemsCount: number,
  overrides: Record<string, unknown> = {},
) => ({
  is_tax_inclusive: false,
  totals: {
    base_items_subtotal_exclusive_money_object: money(0),
    base_items_subtotal_inclusive_money_object: money(0),
    base_order_discount_money_object: money(0),
    base_order_total_exclusive_money_object: money(0),
    base_order_total_inclusive_money_object: money(0),
    base_tax_total_money_object: money(0),
    base_shipping_amount_money_object: money(0),
    base_shipping_strikethrough_money_object: money(0),
    base_total_money_object: money(0),
  },
  tax_lines: [],
  coupons: [],
  items_count: itemsCount,
  items: [
    {
      id: 0,
      quantity: 1,
      base_subtotal_exclusive_money_object: money(0),
      base_subtotal_inclusive_money_object: money(0),
      applied_product_coupons: [],
    },
  ],
  available_shipping_methods: [],
  shipping_method: null,
  ...overrides,
});

const mockCalculationResponse = (
  buildResponse: (requestBody: { items: unknown }) => Record<string, unknown>,
) => {
  let requestCount = 0;

  server.use(
    http.post(
      `${window.kirki_ecommerce.rest_url_base}${endpoints.CALCULATE_ORDER}`,
      async ({ request }) => {
        requestCount += 1;
        const body = (await request.json()) as { items: unknown };
        return HttpResponse.json({
          success: true,
          message: '',
          data: buildResponse(body),
        });
      },
    ),
  );

  return {
    getRequestCount: () => requestCount,
  };
};

const productSelection = (): ProductSelection => ({
  productId: 1,
  productTitle: 'Product',
  thumbnail: null,
  inStock: true,
  regularPrice: money(10),
  salePrice: null,
  variants: [
    {
      variantId: 101,
      variantLabel: 'Default',
      thumbnail: null,
      inStock: true,
      availableQuantity: 10,
      allowBackOrder: false,
      trackInventory: true,
      hasLimitPerOrder: false,
      maxPerOrder: null,
      regularPrice: money(10),
      salePrice: null,
    },
  ],
});

const buildCoupon = (code: string) => ({
  id: 1,
  method: 'code' as const,
  title: code,
  code,
  discount_type: 'amount-off' as const,
  status: 'active' as const,
});

const renderUseOrderCreate = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  return renderHook(() => useOrderCreate(), { wrapper });
};

describe('useOrderCreate debounce -> payload -> query wiring', () => {
  it('leaves the calculation query disabled while no items are picked', () => {
    const { result } = renderUseOrderCreate();

    expect(result.current.rows).toEqual([]);
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.calculation).toBeUndefined();
  });

  it('fires the calculation query, debounced, once an item is picked', async () => {
    let requestedItems: unknown;

    server.use(
      http.post(
        `${window.kirki_ecommerce.rest_url_base}${endpoints.CALCULATE_ORDER}`,
        async ({ request }) => {
          const body = (await request.json()) as { items: unknown };
          requestedItems = body.items;
          return HttpResponse.json({
            success: true,
            message: '',
            data: buildCalculationResponse(1),
          });
        },
      ),
    );

    const { result } = renderUseOrderCreate();

    act(() => {
      result.current.handleAddItems([productSelection()]);
    });

    expect(result.current.rows).toHaveLength(1);

    await waitFor(() => expect(result.current.calculation).toBeDefined(), {
      timeout: 2000,
    });

    expect(result.current.calculation?.items_count).toBe(1);
    expect(requestedItems).toEqual([{ variant_id: 101, quantity: 1 }]);
  });
});

describe('useOrderCreate calculation reconciliation', () => {
  it('syncs a stock-clamped quantity back onto the form', async () => {
    mockCalculationResponse(() =>
      buildCalculationResponse(1, { items: [{ id: 0, quantity: 1, base_subtotal_exclusive_money_object: money(0), base_subtotal_inclusive_money_object: money(0), applied_product_coupons: [] }] }),
    );

    const { result } = renderUseOrderCreate();

    act(() => {
      result.current.handleAddItems([productSelection()]);
    });

    act(() => {
      result.current.handleQuantityChange(0, 5);
    });

    expect(result.current.form.getValues('items.0.quantity')).toBe(5);

    await waitFor(() => expect(result.current.calculation).toBeDefined(), { timeout: 2000 });

    await waitFor(() => expect(result.current.form.getValues('items.0.quantity')).toBe(1), {
      timeout: 2000,
    });
  });

  it('removes a coupon code the calculation did not accept and surfaces it as rejected', async () => {
    mockCalculationResponse(() => buildCalculationResponse(1, { coupons: [] }));

    const { result } = renderUseOrderCreate();

    act(() => {
      result.current.handleAddItems([productSelection()]);
    });

    act(() => {
      result.current.form.setValue('coupon_codes', [buildCoupon('SUMMER')]);
    });

    await waitFor(() => expect(result.current.calculation).toBeDefined(), { timeout: 2000 });

    await waitFor(() => expect(result.current.rejectedCouponCodes).toEqual(['SUMMER']), {
      timeout: 2000,
    });

    expect(result.current.form.getValues('coupon_codes')).toEqual([]);
  });

  it('syncs a calculation-defaulted shipping method back onto the form', async () => {
    mockCalculationResponse(() => buildCalculationResponse(1, { shipping_method: 'express' }));

    const { result } = renderUseOrderCreate();

    act(() => {
      result.current.handleAddItems([productSelection()]);
    });

    act(() => {
      result.current.form.setValue('shipping_method', 'flat_rate');
    });

    await waitFor(() => expect(result.current.calculation).toBeDefined(), { timeout: 2000 });

    await waitFor(() => expect(result.current.form.getValues('shipping_method')).toBe('express'), {
      timeout: 2000,
    });
  });

  it('does not fire a redundant calculation request solely from reconciling the form', async () => {
    const { getRequestCount } = mockCalculationResponse(() =>
      buildCalculationResponse(1, {
        items: [{ id: 0, quantity: 1, base_subtotal_exclusive_money_object: money(0), base_subtotal_inclusive_money_object: money(0), applied_product_coupons: [] }],
      }),
    );

    const { result } = renderUseOrderCreate();

    act(() => {
      result.current.handleAddItems([productSelection()]);
    });

    act(() => {
      result.current.handleQuantityChange(0, 5);
    });

    await waitFor(() => expect(result.current.calculation).toBeDefined(), { timeout: 2000 });
    await waitFor(() => expect(result.current.form.getValues('items.0.quantity')).toBe(1), {
      timeout: 2000,
    });

    expect(getRequestCount()).toBe(1);

    // Wait past both the debounce and the reconcile-guard window so a
    // redundant request, if one were going to fire, would have by now.
    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(getRequestCount()).toBe(1);
  });
});
