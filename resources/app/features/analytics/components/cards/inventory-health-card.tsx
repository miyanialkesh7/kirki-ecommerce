import Flex from '@/components/ui/flex';
import Text from '@/components/ui/text';
import AnalyticsCard from '@/features/analytics/components/analytics-card';
import type { CardProps } from '@/features/analytics/components/cards/card-props';
import StatusBadge from '@/features/analytics/components/status-badge';
import { formatNumber } from '@/features/analytics/lib/format';
import { getMetricDefinitions } from '@/features/analytics/lib/metric-definitions';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';
import { __ } from '@/wpi18n';

const STATUS_TONES = {
  out_of_stock: 'critical',
  low_stock: 'warning',
  in_stock: 'success',
} as const;

const getStatusLabels = (): Record<string, string> => ({
  out_of_stock: __('Out of stock', 'kirki-ecommerce'),
  low_stock: __('Low stock', 'kirki-ecommerce'),
  in_stock: __('In stock', 'kirki-ecommerce'),
});

const InventoryHealthCard = (props: Pick<CardProps<'inventory_health'>, 'data'>) => {
  const { data } = props;
  const definition = getMetricDefinitions().inventory_health;
  const labels = getStatusLabels();
  const counts = [
    { status: 'out_of_stock', count: data.out_of_stock },
    { status: 'low_stock', count: data.low_stock },
    { status: 'in_stock', count: data.in_stock },
  ] as const;

  return (
    <AnalyticsCard
      title={definition.title}
      info={definition.info}
      testId="card-inventory_health"
    >
      <Flex gap={3} wrap="wrap">
        {counts.map((item) => (
          <div key={item.status} css={scoped(styles.count)}>
            <Text variant="heading4" weight="bold">
              {formatNumber(item.count)}
            </Text>
            <StatusBadge tone={STATUS_TONES[item.status]}>{labels[item.status]}</StatusBadge>
          </div>
        ))}
      </Flex>
      {data.lowest.length > 0 && (
        <ul css={scoped(styles.list)}>
          {data.lowest.map((variant) => (
            <li key={variant.variant_id} css={scoped(styles.row)}>
              <div css={scoped(styles.text)}>
                <Text variant="small" weight="medium" truncate>
                  {variant.product_name}
                </Text>
                {variant.variant_name && (
                  <Text variant="tiny" color="subdued" truncate>
                    {variant.variant_name}
                  </Text>
                )}
              </div>
              <Text variant="small" weight="semibold">
                {formatNumber(variant.available_quantity)}
              </Text>
            </li>
          ))}
        </ul>
      )}
      <Text variant="tiny" color="subdued">
        {__('Live, not affected by the date range', 'kirki-ecommerce')}
      </Text>
    </AnalyticsCard>
  );
};

InventoryHealthCard.displayName = 'InventoryHealthCard';

export default InventoryHealthCard;

const styles = defineStyles({
  count: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
    minWidth: '88px',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing[3],
    margin: 0,
    minWidth: 0,
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
});
