import AnalyticsCard from '@/features/analytics/components/analytics-card';
import CardEmpty from '@/features/analytics/components/card-empty';
import type { CardProps } from '@/features/analytics/components/cards/card-props';
import HBarList from '@/features/analytics/components/charts/hbar-list';
import { formatMoney } from '@/features/analytics/lib/format';
import { getMetricDefinitions } from '@/features/analytics/lib/metric-definitions';

const SalesByCategoryCard = (props: CardProps<'sales_by_category'>) => {
  const { data, isEmpty } = props;
  const definition = getMetricDefinitions().sales_by_category;

  return (
    <AnalyticsCard
      title={definition.title}
      info={definition.info}
      testId="card-sales_by_category"
    >
      {isEmpty ? (
        <CardEmpty />
      ) : (
        <HBarList
          items={data.items.map((item) => ({
            key: String(item.category_id ?? 'uncategorized'),
            label: item.name,
            value: Number(item.net_sales_money_object.raw),
            display: formatMoney(item.net_sales_money_object),
            previousValue: item.previous_net_sales_money_object
              ? Number(item.previous_net_sales_money_object.raw)
              : null,
            previousDisplay: item.previous_net_sales_money_object
              ? formatMoney(item.previous_net_sales_money_object)
              : null,
          }))}
        />
      )}
    </AnalyticsCard>
  );
};

SalesByCategoryCard.displayName = 'SalesByCategoryCard';

export default SalesByCategoryCard;
