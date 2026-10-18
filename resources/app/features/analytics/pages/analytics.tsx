import type { UseQueryResult } from '@tanstack/react-query';
import { type ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { Card } from '@/components/ui/card';
import Flex from '@/components/ui/flex';
import { Page, PageContent, PageHeading } from '@/components/ui/page';
import QueryErrorState from '@/components/ui/query-error-state';
import Text from '@/components/ui/text';
import AnalyticsControls from '@/features/analytics/components/analytics-controls';
import { CardSkeleton, KpiSkeleton } from '@/features/analytics/components/analytics-skeletons';
import CardError from '@/features/analytics/components/card-error';
import AverageOrderValueOverTimeCard from '@/features/analytics/components/cards/average-order-value-over-time-card';
import FulfillmentStatusCard from '@/features/analytics/components/cards/fulfillment-status-card';
import InventoryHealthCard from '@/features/analytics/components/cards/inventory-health-card';
import NewVsReturningCustomersCard from '@/features/analytics/components/cards/new-vs-returning-customers-card';
import OrdersByTimeOfDayCard from '@/features/analytics/components/cards/orders-by-time-of-day-card';
import OrdersOverTimeCard from '@/features/analytics/components/cards/orders-over-time-card';
import {
  SalesByCouponCodeCard,
  SalesByPaymentMethodCard,
  ShippingChargesByMethodCard,
  TaxesByRegionCard,
} from '@/features/analytics/components/cards/ranked-list-cards';
import SalesByCategoryCard from '@/features/analytics/components/cards/sales-by-category-card';
import SalesByLocationCard from '@/features/analytics/components/cards/sales-by-location-card';
import SalesByProductCard from '@/features/analytics/components/cards/sales-by-product-card';
import TotalSalesBreakdownCard from '@/features/analytics/components/cards/total-sales-breakdown-card';
import TotalSalesOverTimeCard from '@/features/analytics/components/cards/total-sales-over-time-card';
import KpiCard from '@/features/analytics/components/kpi-card';
import { type EmptyCheckedCard, hasNoCardData } from '@/features/analytics/lib/empty-cards';
import { formatMoney, formatNumber, formatPercent } from '@/features/analytics/lib/format';
import { getMetricDefinitions } from '@/features/analytics/lib/metric-definitions';
import {
  createCompactMinorFormatter,
  createMinorFormatter,
} from '@/features/analytics/lib/money-format';
import {
  type AnalyticsParams,
  parseAnalyticsParams,
  serializeAnalyticsParams,
} from '@/features/analytics/lib/url-state';
import {
  type AnalyticsCards,
  type AnalyticsKpis,
  type AnalyticsMeta,
  type AnalyticsMetric,
  METRIC_KEYS,
} from '@/features/analytics/schemas/catalog/analytics';
import {
  type AnalyticsMetricQueries,
  useAnalyticsMetricQueries,
} from '@/features/analytics/services/analytics';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';
import { __ } from '@/wpi18n';

const KPI_COUNT = 4;

const sharedCardProps = (meta: AnalyticsMeta) => {
  const currencyCode = meta.base_currency_code ?? 'USD';

  return {
    formatMinor: createMinorFormatter(currencyCode),
    formatMinorShort: createCompactMinorFormatter(currencyCode),
    range: meta.range ? { from: meta.range.from, to: meta.range.to } : null,
    compareRange: meta.compare ?? null,
  };
};

type CardSlotProps<K extends keyof AnalyticsCards> = {
  cardKey: K;
  size: 'half' | 'full';
  query: UseQueryResult<AnalyticsMetric<K>>;
  children: (data: AnalyticsMetric<K>['data'], meta: AnalyticsMeta) => ReactNode;
};

const CardSlot = <K extends keyof AnalyticsCards>(props: CardSlotProps<K>) => {
  const { cardKey, size, query, children } = props;

  if (query.isError) {
    return (
      <CardError
        cardKey={cardKey}
        size={size}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <CardSkeleton size={size} />;
  }

  return children(query.data.data, query.data.meta);
};

CardSlot.displayName = 'CardSlot';

type KpiRowProps = {
  query: UseQueryResult<AnalyticsMetric<'kpis'>>;
};

const KpiRow = (props: KpiRowProps) => {
  const { query } = props;

  if (query.isError) {
    return (
      <div css={scoped(styles.kpis)}>
        <Card data-testid="kpi-error" cssOverride={styles.kpiError}>
          <QueryErrorState onRetry={() => void query.refetch()} isRetrying={query.isFetching} />
        </Card>
      </div>
    );
  }

  if (!query.data) {
    return (
      <div css={scoped(styles.kpis)}>
        {Array.from({ length: KPI_COUNT }, (_, index) => (
          <KpiSkeleton key={index} />
        ))}
      </div>
    );
  }

  const kpis: AnalyticsKpis = query.data.data;
  const hasComparison = !!query.data.meta.compare;
  const definitions = getMetricDefinitions();

  return (
    <div css={scoped(styles.kpis)}>
      <KpiCard
        metricKey="gross_sales"
        title={definitions.gross_sales.title}
        info={definitions.gross_sales.info}
        value={formatMoney(kpis.gross_sales.current_money_object)}
        change={kpis.gross_sales.change}
        hasComparison={hasComparison}
        series={kpis.gross_sales.series}
      />
      <KpiCard
        metricKey="orders"
        title={definitions.orders.title}
        info={definitions.orders.info}
        value={formatNumber(kpis.orders.current)}
        change={kpis.orders.change}
        hasComparison={hasComparison}
        series={kpis.orders.series}
      />
      <KpiCard
        metricKey="average_order_value"
        title={definitions.average_order_value.title}
        info={definitions.average_order_value.info}
        value={formatMoney(kpis.average_order_value.current_money_object)}
        change={kpis.average_order_value.change}
        hasComparison={hasComparison}
        series={kpis.average_order_value.series}
      />
      <KpiCard
        metricKey="returning_customer_rate"
        title={definitions.returning_customer_rate.title}
        info={definitions.returning_customer_rate.info}
        value={formatPercent(kpis.returning_customer_rate.current)}
        change={kpis.returning_customer_rate.change}
        hasComparison={hasComparison}
        series={kpis.returning_customer_rate.series}
      />
    </div>
  );
};

KpiRow.displayName = 'KpiRow';

type MetricsContentProps = {
  queries: AnalyticsMetricQueries;
  params: AnalyticsParams;
};

const MetricsContent = (props: MetricsContentProps) => {
  const { queries, params } = props;

  const firstMeta = METRIC_KEYS.map((key) => queries[key].data?.meta).find((meta) => !!meta);
  const isEmpty = <K extends EmptyCheckedCard>(
    key: K,
    data: AnalyticsCards[K],
    meta: AnalyticsMeta,
  ) => {
    return meta.has_orders === false || hasNoCardData(key, data);
  };

  return (
    <>
      {firstMeta?.has_orders === false && (
        <div role="status" css={scoped(styles.banner)}>
          <Text variant="small">
            {__(
              'Your store has no orders yet. Analytics fills in as soon as customers start paying for orders.',
              'kirki-ecommerce',
            )}
          </Text>
        </div>
      )}
      <KpiRow query={queries.kpis} />
      <div css={scoped(styles.cards)}>
        <CardSlot cardKey="total_sales_over_time" size="full" query={queries.total_sales_over_time}>
          {(data, meta) => (
            <TotalSalesOverTimeCard
              data={data}
              isEmpty={isEmpty('total_sales_over_time', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="total_sales_breakdown" size="half" query={queries.total_sales_breakdown}>
          {(data, meta) => (
            <TotalSalesBreakdownCard
              data={data}
              isEmpty={isEmpty('total_sales_breakdown', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="sales_by_product" size="half" query={queries.sales_by_product}>
          {(data, meta) => (
            <SalesByProductCard
              data={data}
              isEmpty={isEmpty('sales_by_product', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="sales_by_category" size="half" query={queries.sales_by_category}>
          {(data, meta) => (
            <SalesByCategoryCard
              data={data}
              isEmpty={isEmpty('sales_by_category', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot
          cardKey="average_order_value_over_time"
          size="half"
          query={queries.average_order_value_over_time}
        >
          {(data, meta) => (
            <AverageOrderValueOverTimeCard
              data={data}
              isEmpty={isEmpty('average_order_value_over_time', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="orders_over_time" size="half" query={queries.orders_over_time}>
          {(data, meta) => (
            <OrdersOverTimeCard
              data={data}
              isEmpty={isEmpty('orders_over_time', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot
          cardKey="orders_by_fulfillment_status"
          size="half"
          query={queries.orders_by_fulfillment_status}
        >
          {(data, meta) => (
            <FulfillmentStatusCard
              data={data}
              isEmpty={isEmpty('orders_by_fulfillment_status', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot
          cardKey="new_vs_returning_customers"
          size="half"
          query={queries.new_vs_returning_customers}
        >
          {(data, meta) => (
            <NewVsReturningCustomersCard
              data={data}
              isEmpty={isEmpty('new_vs_returning_customers', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="sales_by_coupon_code" size="half" query={queries.sales_by_coupon_code}>
          {(data, meta) => (
            <SalesByCouponCodeCard
              data={data}
              isEmpty={isEmpty('sales_by_coupon_code', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="orders_by_time_of_day" size="full" query={queries.orders_by_time_of_day}>
          {(data, meta) => (
            <OrdersByTimeOfDayCard
              data={data}
              isEmpty={isEmpty('orders_by_time_of_day', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="sales_by_location" size="full" query={queries.sales_by_location}>
          {(data, meta) => (
            <SalesByLocationCard
              data={data}
              isEmpty={isEmpty('sales_by_location', data, meta)}
              params={params}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot
          cardKey="sales_by_payment_method"
          size="half"
          query={queries.sales_by_payment_method}
        >
          {(data, meta) => (
            <SalesByPaymentMethodCard
              data={data}
              isEmpty={isEmpty('sales_by_payment_method', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="taxes_by_region" size="half" query={queries.taxes_by_region}>
          {(data, meta) => (
            <TaxesByRegionCard
              data={data}
              isEmpty={isEmpty('taxes_by_region', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot
          cardKey="shipping_charges_by_method"
          size="half"
          query={queries.shipping_charges_by_method}
        >
          {(data, meta) => (
            <ShippingChargesByMethodCard
              data={data}
              isEmpty={isEmpty('shipping_charges_by_method', data, meta)}
              {...sharedCardProps(meta)}
            />
          )}
        </CardSlot>
        <CardSlot cardKey="inventory_health" size="half" query={queries.inventory_health}>
          {(data) => <InventoryHealthCard data={data} />}
        </CardSlot>
      </div>
    </>
  );
};

MetricsContent.displayName = 'MetricsContent';

const Analytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseAnalyticsParams(searchParams), [searchParams]);
  const queries = useAnalyticsMetricQueries(params);
  const hasAllFailed = METRIC_KEYS.every((key) => queries[key].isError);

  const handleChange = (next: AnalyticsParams) => {
    setSearchParams(serializeAnalyticsParams(next));
  };

  const handleRetryAll = () => {
    METRIC_KEYS.forEach((key) => void queries[key].refetch());
  };

  return (
    <Page containerSize="xxl">
      <PageHeading text={__('Analytics', 'kirki-ecommerce')} />
      <PageContent>
        <Flex direction="column" gap={4} cssOverride={styles.content}>
          <AnalyticsControls params={params} onChange={handleChange} />
          {hasAllFailed ? (
            <QueryErrorState onRetry={handleRetryAll} />
          ) : (
            <MetricsContent queries={queries} params={params} />
          )}
        </Flex>
      </PageContent>
    </Page>
  );
};

Analytics.displayName = 'Analytics';

export default Analytics;

const styles = defineStyles({
  content: {
    paddingBottom: theme.spacing[8],
  },
  kpis: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: theme.spacing[4],
    '@media (max-width: 1100px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media (max-width: 599px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
  cards: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
  },
  kpiError: {
    gridColumn: '1 / -1',
    padding: theme.spacing[4],
    boxSizing: 'border-box',
  },
  banner: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.analytics.status.warningSubtleBackground,
  },
});
