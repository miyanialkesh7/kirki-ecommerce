import Text from '@/components/ui/text';
import AnalyticsCard from '@/features/analytics/components/analytics-card';
import CardEmpty from '@/features/analytics/components/card-empty';
import CardHeadline from '@/features/analytics/components/card-headline';
import type { CardProps } from '@/features/analytics/components/cards/card-props';
import BarChart from '@/features/analytics/components/charts/bar-chart';
import { formatNumber } from '@/features/analytics/lib/format';
import { getMetricDefinitions } from '@/features/analytics/lib/metric-definitions';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';
import { __ } from '@/wpi18n';

const SEGMENT_COLORS = [theme.colors.analytics.series.primary, theme.colors.analytics.series.secondary];

const NewVsReturningCustomersCard = (props: CardProps<'new_vs_returning_customers'>) => {
  const { data, isEmpty } = props;
  const definition = getMetricDefinitions().new_vs_returning_customers;
  const segmentNames = [__('New', 'kirki-ecommerce'), __('Returning', 'kirki-ecommerce')];

  return (
    <AnalyticsCard
      title={definition.title}
      info={definition.info}
      testId="card-new_vs_returning_customers"
    >
      {isEmpty ? (
        <CardEmpty />
      ) : (
        <>
          <CardHeadline value={formatNumber(data.total.current)} change={data.total.change} />
          <BarChart
            label={definition.title}
            points={data.series.map((point) => ({
              date: point.date,
              label: point.label,
              value: point.new + point.returning,
              segments: [point.new, point.returning],
              previous_label: point.previous_label,
              previous_value:
                point.previous_new === null || point.previous_new === undefined
                  ? null
                  : point.previous_new + (point.previous_returning ?? 0),
              previous_segments:
                point.previous_new === null || point.previous_new === undefined
                  ? undefined
                  : [point.previous_new, point.previous_returning ?? 0],
            }))}
            formatValue={formatNumber}
            segmentNames={segmentNames}
            segmentColors={SEGMENT_COLORS}
          />
          <ul css={scoped(styles.legend)}>
            {[data.new_total, data.returning_total].map((total, index) => (
              <li key={segmentNames[index]} css={scoped(styles.item)}>
                <span
                  css={scoped(styles.dot)}
                  style={{ backgroundColor: SEGMENT_COLORS[index] }}
                  aria-hidden="true"
                />
                <Text variant="small">
                  {segmentNames[index]}: {formatNumber(total)}
                </Text>
              </li>
            ))}
          </ul>
        </>
      )}
    </AnalyticsCard>
  );
};

NewVsReturningCustomersCard.displayName = 'NewVsReturningCustomersCard';

export default NewVsReturningCustomersCard;

const styles = defineStyles({
  legend: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    gap: theme.spacing[4],
  },
  item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    margin: 0,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: theme.radius.full,
  },
});
