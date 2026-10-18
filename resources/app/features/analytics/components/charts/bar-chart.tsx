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

type BarChartProps = ChartProps & {
  segmentNames?: string[];
  segmentColors?: string[];
};

const BAR_WIDTH_RATIO = 0.56;
const MAX_BAR_WIDTH = 40;

const BarChart = (props: BarChartProps) => {
  const {
    label,
    points,
    formatValue = defaultFormatValue,
    formatAxisValue = formatCompactNumber,
    legend,
    segmentNames,
    segmentColors,
  } = props;
  const { activeIndex, getHandlers } = useActivePoint();
  const totals = points.map(
    (point) => point.segments?.reduce((sum, value) => sum + value, 0) ?? point.value,
  );
  const previousTotals = points.map(
    (point) =>
      point.previous_segments?.reduce((sum, value) => sum + value, 0) ?? point.previous_value,
  );
  const scale = buildScale([...totals, ...previousTotals]);

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
      legendSample="bar"
      segmentNames={segmentNames}
    >
      {(layout) =>
        points.map((point, index) => {
          const barWidth = Math.min(layout.slotWidth * BAR_WIDTH_RATIO, MAX_BAR_WIDTH);
          const center = layout.getX(index);
          const segments = point.segments ?? (typeof point.value === 'number' ? [point.value] : []);
          let running = 0;

          return (
            <g key={point.date} aria-hidden="true">
              {typeof previousTotals[index] === 'number' && (
                <line
                  x1={center - barWidth / 2}
                  x2={center + barWidth / 2}
                  y1={scale.toY(previousTotals[index])}
                  y2={scale.toY(previousTotals[index])}
                  css={scoped(styles.previousMark)}
                />
              )}
              {segments.map((segment, position) => {
                const top = scale.toY(running + segment);
                const bottom = scale.toY(running);
                running += segment;

                return (
                  <rect
                    key={segmentNames?.[position] ?? position}
                    x={center - barWidth / 2}
                    y={Math.min(top, bottom)}
                    width={barWidth}
                    height={Math.abs(bottom - top)}
                    rx={2}
                    css={scoped(styles.bar)}
                    style={
                      segmentColors?.[position] ? { fill: segmentColors[position] } : undefined
                    }
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.55}
                  />
                );
              })}
            </g>
          );
        })
      }
    </ChartFrame>
  );
};

BarChart.displayName = 'BarChart';

export default BarChart;
export type { BarChartProps };

const styles = defineStyles({
  bar: {
    fill: theme.colors.analytics.chart.primary,
  },
  previousMark: {
    stroke: theme.colors.analytics.chart.comparisonLine,
    strokeWidth: 2,
  },
});
