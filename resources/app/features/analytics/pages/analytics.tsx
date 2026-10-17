import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import Flex from '@/components/ui/flex';
import { Page, PageContent, PageHeading } from '@/components/ui/page';
import QueryErrorState from '@/components/ui/query-error-state';
import Text from '@/components/ui/text';
import AnalyticsControls from '@/features/analytics/components/analytics-controls';
import { CardSkeleton, KpiSkeleton } from '@/features/analytics/components/analytics-skeletons';
import AverageOrderValueOverTimeCard from '@/features/analytics/components/cards/average-order-value-over-time-card';
import FulfillmentStatusCard from '@/features/analytics/components/cards/fulfillment-status-card';
import InventoryHealthCard from '@/features/analytics/components/cards/inventory-health-card';
import NewVsReturningCustomersCard from '@/features/analytics/components/cards/new-vs-returning-customers-card';
import OrdersOverTimeCard from '@/features/analytics/components/cards/orders-over-time-card';
import {
  SalesByCouponCodeCard,
  SalesByPaymentMethodCard,
  ShippingChargesByMethodCard,
  TaxesByRegionCard,
} from '@/features/analytics/components/cards/ranked-list-cards';
import SalesByCategoryCard from '@/features/analytics/components/cards/sales-by-category-card';
import SalesByProductCard from '@/features/analytics/components/cards/sales-by-product-card';
import TotalSalesBreakdownCard from '@/features/analytics/components/cards/total-sales-breakdown-card';
import TotalSalesOverTimeCard from '@/features/analytics/components/cards/total-sales-over-time-card';
import KpiCard from '@/features/analytics/components/kpi-card';
import { type EmptyCheckedCard, hasNoCardData } from '@/features/analytics/lib/empty-cards';
import { formatMoney, formatNumber, formatPercent } from '@/features/analytics/lib/format';
import { getMetricDefinitions } from '@/features/analytics/lib/metric-definitions';
import { createMinorFormatter } from '@/features/analytics/lib/money-format';
import {
  type AnalyticsParams,
  parseAnalyticsParams,
  serializeAnalyticsParams,
} from '@/features/analytics/lib/url-state';
import type { AnalyticsOverview } from '@/features/analytics/schemas/catalog/analytics';
import { useAnalyticsOverviewQuery } from '@/features/analytics/services/analytics';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';
import { __ } from '@/wpi18n';

const KPI_COUNT = 4;
const CARD_SKELETON_SIZES: ('half' | 'full')[] = [
  'full',
  ...Array.from({ length: 12 }, () => 'half' as const),
];

type ReadyContentProps = {
  data: AnalyticsOverview;
  params: AnalyticsParams;
};

const ReadyContent = (props: ReadyContentProps) => {
  const { data, params } = props;
  const { kpis, cards } = data;

  const definitions = getMetricDefinitions();
  const hasComparison = !!data.compare;
  const isEmptyStore = data.has_orders === false;
  const formatMinor = createMinorFormatter(params.currency ?? data.base_currency_code ?? 'USD');
  const isEmpty = (key: EmptyCheckedCard) => isEmptyStore || hasNoCardData(key, cards);
  const showRoundingNote = !!params.currency && params.currency !== data.base_currency_code;

  return (
    <>
      {isEmptyStore && (
        <div role="status" css={scoped(styles.banner)}>
          <Text variant="small">
            {__(
              'Your store has no orders yet. Analytics fills in as soon as customers start paying for orders.',
              'kirki-ecommerce',
            )}
          </Text>
        </div>
      )}
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
      <div css={scoped(styles.cards)}>
        <TotalSalesOverTimeCard
          data={cards.total_sales_over_time}
          isEmpty={isEmpty('total_sales_over_time')}
          formatMinor={formatMinor}
        />
        <TotalSalesBreakdownCard
          data={cards.total_sales_breakdown}
          isEmpty={isEmpty('total_sales_breakdown')}
          formatMinor={formatMinor}
          showRoundingNote={showRoundingNote}
        />
        <SalesByProductCard
          data={cards.sales_by_product}
          isEmpty={isEmpty('sales_by_product')}
          formatMinor={formatMinor}
        />
        <SalesByCategoryCard
          data={cards.sales_by_category}
          isEmpty={isEmpty('sales_by_category')}
          formatMinor={formatMinor}
        />
        <AverageOrderValueOverTimeCard
          data={cards.average_order_value_over_time}
          isEmpty={isEmpty('average_order_value_over_time')}
          formatMinor={formatMinor}
        />
        <OrdersOverTimeCard
          data={cards.orders_over_time}
          isEmpty={isEmpty('orders_over_time')}
          formatMinor={formatMinor}
        />
        <FulfillmentStatusCard
          data={cards.orders_by_fulfillment_status}
          isEmpty={isEmpty('orders_by_fulfillment_status')}
          formatMinor={formatMinor}
        />
        <NewVsReturningCustomersCard
          data={cards.new_vs_returning_customers}
          isEmpty={isEmpty('new_vs_returning_customers')}
          formatMinor={formatMinor}
        />
        <SalesByCouponCodeCard
          data={cards.sales_by_coupon_code}
          isEmpty={isEmpty('sales_by_coupon_code')}
          formatMinor={formatMinor}
        />
        <SalesByPaymentMethodCard
          data={cards.sales_by_payment_method}
          isEmpty={isEmpty('sales_by_payment_method')}
          formatMinor={formatMinor}
        />
        <TaxesByRegionCard
          data={cards.taxes_by_region}
          isEmpty={isEmpty('taxes_by_region')}
          formatMinor={formatMinor}
        />
        <ShippingChargesByMethodCard
          data={cards.shipping_charges_by_method}
          isEmpty={isEmpty('shipping_charges_by_method')}
          formatMinor={formatMinor}
        />
        <InventoryHealthCard data={cards.inventory_health} />
      </div>
    </>
  );
};

ReadyContent.displayName = 'ReadyContent';

const Analytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseAnalyticsParams(searchParams), [searchParams]);
  const { data, isLoading, isPending, isError, refetch } = useAnalyticsOverviewQuery(params);

  const handleChange = (next: AnalyticsParams) => {
    setSearchParams(serializeAnalyticsParams(next));
  };

  const renderContent = () => {
    if (isError) {
      return <QueryErrorState onRetry={() => void refetch()} />;
    }

    if (isLoading || isPending || !data) {
      return (
        <>
          <div css={scoped(styles.kpis)}>
            {Array.from({ length: KPI_COUNT }, (_, index) => (
              <KpiSkeleton key={index} />
            ))}
          </div>
          <div css={scoped(styles.cards)}>
            {CARD_SKELETON_SIZES.map((size, index) => (
              <CardSkeleton key={index} size={size} />
            ))}
          </div>
        </>
      );
    }

    return <ReadyContent data={data} params={params} />;
  };

  return (
    <Page containerSize="xl">
      <PageHeading text={__('Analytics', 'kirki-ecommerce')} />
      <PageContent>
        <Flex direction="column" gap={4} cssOverride={styles.content}>
          <AnalyticsControls
            params={params}
            onChange={handleChange}
            currencies={data?.currencies ?? []}
            baseCurrency={data?.base_currency_code ?? null}
          />
          {renderContent()}
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
  banner: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.analytics.status.warningSubtleBackground,
  },
});
