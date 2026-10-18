import AnalyticsCard from '@/features/analytics/components/analytics-card';
import CardEmpty from '@/features/analytics/components/card-empty';
import type { CardProps } from '@/features/analytics/components/cards/card-props';
import RankedList from '@/features/analytics/components/cards/ranked-list';
import HBarList from '@/features/analytics/components/charts/hbar-list';
import { formatMoney, formatNumber } from '@/features/analytics/lib/format';
import { getMetricDefinitions, type MetricKey } from '@/features/analytics/lib/metric-definitions';
import { __, _n, sprintf } from '@/wpi18n';

const formatOrders = (orders: number) => {
  return sprintf(
    /* translators: %s: number of orders */
    _n('%s order', '%s orders', orders, 'kirki-ecommerce'),
    formatNumber(orders),
  );
};

type RankedCardShellProps = {
  metric: MetricKey;
  isEmpty: boolean;
  items: { key: string; label: string; detail?: string; value: string }[];
};

const RankedCardShell = (props: RankedCardShellProps) => {
  const { metric, isEmpty, items } = props;
  const definition = getMetricDefinitions()[metric];

  return (
    <AnalyticsCard title={definition.title} info={definition.info} testId={`card-${metric}`}>
      {isEmpty ? <CardEmpty /> : <RankedList items={items} />}
    </AnalyticsCard>
  );
};

RankedCardShell.displayName = 'RankedCardShell';

const SalesByCouponCodeCard = (props: CardProps<'sales_by_coupon_code'>) => {
  const { data, isEmpty } = props;
  const definition = getMetricDefinitions().sales_by_coupon_code;

  return (
    <AnalyticsCard
      title={definition.title}
      info={definition.info}
      testId="card-sales_by_coupon_code"
    >
      {isEmpty ? (
        <CardEmpty />
      ) : (
        <HBarList
          items={data.items.map((item) => ({
            key: item.code,
            label: item.code,
            value: item.orders,
            display: formatNumber(item.orders),
            detail: sprintf(
              /* translators: %s: discount amount given by the coupon code */
              __('%s off', 'kirki-ecommerce'),
              formatMoney(item.discount_given_money_object),
            ),
            change: item.change,
          }))}
        />
      )}
    </AnalyticsCard>
  );
};

SalesByCouponCodeCard.displayName = 'SalesByCouponCodeCard';

const SalesByPaymentMethodCard = (props: CardProps<'sales_by_payment_method'>) => {
  const { data, isEmpty } = props;
  const definition = getMetricDefinitions().sales_by_payment_method;

  return (
    <AnalyticsCard
      title={definition.title}
      info={definition.info}
      testId="card-sales_by_payment_method"
    >
      {isEmpty ? (
        <CardEmpty />
      ) : (
        <HBarList
          items={data.items.map((item) => ({
            key: item.id,
            label: item.name,
            value: Number(item.total_sales_money_object.raw),
            display: formatMoney(item.total_sales_money_object),
            detail: formatOrders(item.orders),
            change: item.change,
          }))}
        />
      )}
    </AnalyticsCard>
  );
};

SalesByPaymentMethodCard.displayName = 'SalesByPaymentMethodCard';

const TaxesByRegionCard = (props: CardProps<'taxes_by_region'>) => {
  const { data, isEmpty } = props;

  return (
    <RankedCardShell
      metric="taxes_by_region"
      isEmpty={isEmpty}
      items={data.items.map((item) => ({
        key: `${item.country ?? ''}-${item.state ?? ''}`,
        label: item.name,
        detail: sprintf(
          /* translators: 1: product tax amount, 2: shipping tax amount */
          __('Product %1$s · Shipping %2$s', 'kirki-ecommerce'),
          formatMoney(item.product_tax_money_object),
          formatMoney(item.shipping_tax_money_object),
        ),
        value: formatMoney(item.total_tax_money_object),
      }))}
    />
  );
};

TaxesByRegionCard.displayName = 'TaxesByRegionCard';

const ShippingChargesByMethodCard = (props: CardProps<'shipping_charges_by_method'>) => {
  const { data, isEmpty } = props;

  return (
    <RankedCardShell
      metric="shipping_charges_by_method"
      isEmpty={isEmpty}
      items={data.items.map((item) => ({
        key: item.id,
        label: item.name,
        detail: formatOrders(item.orders),
        value: formatMoney(item.shipping_charges_money_object),
      }))}
    />
  );
};

ShippingChargesByMethodCard.displayName = 'ShippingChargesByMethodCard';

export {
  SalesByCouponCodeCard,
  SalesByPaymentMethodCard,
  ShippingChargesByMethodCard,
  TaxesByRegionCard,
};
