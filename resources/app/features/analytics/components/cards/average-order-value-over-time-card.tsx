import AnalyticsCard from '@/features/analytics/components/analytics-card';
import CardEmpty from '@/features/analytics/components/card-empty';
import CardHeadline from '@/features/analytics/components/card-headline';
import type { CardProps } from '@/features/analytics/components/cards/card-props';
import DotChart from '@/features/analytics/components/charts/dot-chart';
import { toChartLegend, toChartPoints } from '@/features/analytics/lib/chart-points';
import { formatMoney } from '@/features/analytics/lib/format';
import { getMetricDefinitions } from '@/features/analytics/lib/metric-definitions';

const AverageOrderValueOverTimeCard = (props: CardProps<'average_order_value_over_time'>) => {
  const { data, isEmpty, formatMinor, formatMinorShort, range, compareRange } = props;
  const definition = getMetricDefinitions().average_order_value_over_time;

  return (
    <AnalyticsCard
      title={definition.title}
      info={definition.info}
      testId="card-average_order_value_over_time"
    >
      {isEmpty ? (
        <CardEmpty />
      ) : (
        <>
          <CardHeadline
            value={formatMoney(data.total.current_money_object)}
            change={data.total.change}
          />
          <DotChart
            label={definition.title}
            points={toChartPoints(data.series)}
            formatValue={formatMinor}
            formatAxisValue={formatMinorShort}
            legend={toChartLegend(range, compareRange)}
          />
        </>
      )}
    </AnalyticsCard>
  );
};

AverageOrderValueOverTimeCard.displayName = 'AverageOrderValueOverTimeCard';

export default AverageOrderValueOverTimeCard;
