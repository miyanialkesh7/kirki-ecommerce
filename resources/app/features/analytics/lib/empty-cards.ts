import { hasNoSeriesValues } from '@/features/analytics/lib/chart-points';
import type { AnalyticsCards } from '@/features/analytics/schemas/catalog/analytics';

type EmptyCheckedCard = Exclude<keyof AnalyticsCards, 'inventory_health'>;

const isZero = (value: number | string | null | undefined) => !value || Number(value) === 0;

const CHECKS: Record<EmptyCheckedCard, (cards: AnalyticsCards) => boolean> = {
  total_sales_over_time: (cards) => hasNoSeriesValues(cards.total_sales_over_time.series),
  total_sales_breakdown: (cards) =>
    cards.total_sales_breakdown.rows.every((row) => isZero(row.current_money_object?.raw)),
  sales_by_product: (cards) => cards.sales_by_product.items.length === 0,
  sales_by_category: (cards) => cards.sales_by_category.items.length === 0,
  average_order_value_over_time: (cards) =>
    hasNoSeriesValues(cards.average_order_value_over_time.series),
  orders_over_time: (cards) => hasNoSeriesValues(cards.orders_over_time.series),
  orders_by_fulfillment_status: (cards) => cards.orders_by_fulfillment_status.total_orders === 0,
  new_vs_returning_customers: (cards) =>
    cards.new_vs_returning_customers.series.every((point) => point.new === 0 && point.returning === 0),
  sales_by_coupon_code: (cards) => cards.sales_by_coupon_code.items.length === 0,
  sales_by_payment_method: (cards) => cards.sales_by_payment_method.items.length === 0,
  taxes_by_region: (cards) => cards.taxes_by_region.items.length === 0,
  shipping_charges_by_method: (cards) => cards.shipping_charges_by_method.items.length === 0,
};

const hasNoCardData = (key: EmptyCheckedCard, cards: AnalyticsCards) => CHECKS[key](cards);

export { hasNoCardData };
export type { EmptyCheckedCard };
