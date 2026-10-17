import { describe, expect, it } from 'vitest';

import { AnalyticsOverviewSchema } from '@/features/analytics/schemas/catalog/analytics';

import { buildEmptyStoreOverview, buildOverview, moneyMetric } from '../../fixtures';

describe('AnalyticsOverviewSchema', () => {
  it('accepts the payload served by GET /analytics/overview', () => {
    const result = AnalyticsOverviewSchema.safeParse(buildOverview());

    expect(result.success).toBe(true);
  });

  it('keeps the metrics of a ready response', () => {
    const parsed = AnalyticsOverviewSchema.parse(buildOverview());

    expect(parsed.granularity).toBe('day');
    expect(parsed.currencies).toEqual(['USD']);
    expect(parsed.kpis?.gross_sales.current_money_object?.display).toBe('$62.00');
    expect(parsed.kpis?.orders.current).toBe(12);
    expect(parsed.cards?.total_sales_breakdown.rows).toHaveLength(7);
    expect(parsed.cards?.orders_by_fulfillment_status.items.map((item) => item.status)).toContain(
      'returned',
    );
  });

  it('accepts a response for a store with no orders (empty values and no comparison change)', () => {
    expect(AnalyticsOverviewSchema.safeParse(buildEmptyStoreOverview()).success).toBe(true);
  });

  it('accepts a response with no comparison', () => {
    const result = AnalyticsOverviewSchema.safeParse(
      buildOverview({
        top: { compare: null },
        kpis: { gross_sales: { ...moneyMetric(6200, null, null), series: [] } },
      }),
    );

    expect(result.success).toBe(true);
  });

  it('accepts an empty change (zero comparison) and an empty Average order value', () => {
    const result = AnalyticsOverviewSchema.safeParse(
      buildOverview({
        kpis: { average_order_value: { ...moneyMetric(null, null, null), series: [] } },
      }),
    );

    expect(result.success).toBe(true);
  });

  it('ignores fields it does not know, so a newer backend does not break the page', () => {
    const result = AnalyticsOverviewSchema.safeParse({
      ...buildOverview(),
      brand_new_field: { a: 1 },
    });

    expect(result.success).toBe(true);
  });

  // Scenario: First visit (the response always carries the metrics)
  it('rejects a response without the key metrics', () => {
    const { kpis: _kpis, ...withoutKpis } = buildOverview();

    expect(AnalyticsOverviewSchema.safeParse({ preparing: false, ...withoutKpis }).success).toBe(
      false,
    );
  });

  it('rejects a response without the cards', () => {
    const { cards: _cards, ...withoutCards } = buildOverview();

    expect(AnalyticsOverviewSchema.safeParse({ preparing: false, ...withoutCards }).success).toBe(
      false,
    );
  });

  it('rejects a money metric whose money object is malformed', () => {
    const result = AnalyticsOverviewSchema.safeParse(
      buildOverview({
        kpis: {
          gross_sales: {
            current_money_object: { raw: 1 },
            previous_money_object: null,
            change: null,
            series: [],
          },
        },
      }),
    );

    expect(result.success).toBe(false);
  });
});
