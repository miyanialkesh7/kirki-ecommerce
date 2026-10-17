import {
  buildScale,
  type ChartProps,
  defaultFormatValue,
  getSlotCenter,
  useActivePoint,
} from '@/features/analytics/components/charts/chart-geometry';
import {
  AxisLabels,
  ChartFrame,
  Grid,
  HitAreas,
} from '@/features/analytics/components/charts/chart-shared';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';

const DotChart = (props: ChartProps) => {
  const { label, points, formatValue = defaultFormatValue } = props;
  const { activeIndex, getHandlers } = useActivePoint();
  const scale = buildScale(points.flatMap((point) => [point.value, point.previous_value]));

  return (
    <ChartFrame label={label} points={points} activeIndex={activeIndex} formatValue={formatValue}>
      <Grid scale={scale} />
      {points.map((point, index) => (
        <g key={point.date} aria-hidden="true">
          {typeof point.previous_value === 'number' && (
            <circle
              cx={getSlotCenter(index, points.length)}
              cy={scale.toY(point.previous_value)}
              r={3.5}
              css={scoped(styles.previousDot)}
            />
          )}
          {typeof point.value === 'number' && (
            <circle
              cx={getSlotCenter(index, points.length)}
              cy={scale.toY(point.value)}
              r={activeIndex === index ? 6 : 4.5}
              css={scoped(styles.dot)}
            />
          )}
        </g>
      ))}
      <AxisLabels points={points} />
      <HitAreas points={points} formatValue={formatValue} getHandlers={getHandlers} />
    </ChartFrame>
  );
};

DotChart.displayName = 'DotChart';

export default DotChart;

const styles = defineStyles({
  dot: {
    fill: theme.colors.analytics.chart.primary,
  },
  previousDot: {
    fill: theme.colors.analytics.chart.previous,
  },
});
