import {
  buildScale,
  type ChartProps,
  defaultFormatValue,
  useActivePoint,
} from '@/features/analytics/components/charts/chart-geometry';
import { ChartFrame } from '@/features/analytics/components/charts/chart-shared';
import { formatCompactNumber } from '@/features/analytics/lib/format';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';

const DotChart = (props: ChartProps) => {
  const {
    label,
    points,
    formatValue = defaultFormatValue,
    formatAxisValue = formatCompactNumber,
    legend,
  } = props;
  const { activeIndex, getHandlers } = useActivePoint();
  const scale = buildScale(points.flatMap((point) => [point.value, point.previous_value]));

  return (
    <ChartFrame
      label={label}
      points={points}
      scale={scale}
      activeIndex={activeIndex}
      getHandlers={getHandlers}
      formatValue={formatValue}
      formatAxisValue={formatAxisValue}
      legend={legend}
      legendSample="dot"
    >
      {(layout) =>
        points.map((point, index) => (
          <g key={point.date} aria-hidden="true">
            {typeof point.previous_value === 'number' && (
              <circle
                cx={layout.getX(index)}
                cy={scale.toY(point.previous_value)}
                r={3.5}
                css={scoped(styles.previousDot)}
              />
            )}
            {typeof point.value === 'number' && (
              <circle
                cx={layout.getX(index)}
                cy={scale.toY(point.value)}
                r={activeIndex === index ? 6 : 4.5}
                css={scoped(styles.dot)}
              />
            )}
          </g>
        ))
      }
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
