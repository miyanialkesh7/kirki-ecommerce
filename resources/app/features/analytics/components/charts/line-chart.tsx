import {
  buildScale,
  type ChartProps,
  defaultFormatValue,
  getSlotCenter,
  PLOT_BOTTOM,
  PLOT_TOP,
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

const buildPath = (values: (number | null | undefined)[], toY: (value: number) => number) => {
  let path = '';
  let isDrawing = false;

  values.forEach((value, index) => {
    if (typeof value !== 'number') {
      isDrawing = false;
      return;
    }

    path += `${isDrawing ? 'L' : 'M'}${getSlotCenter(index, values.length)},${toY(value)} `;
    isDrawing = true;
  });

  return path.trim();
};

const LineChart = (props: ChartProps) => {
  const { label, points, formatValue = defaultFormatValue } = props;
  const { activeIndex, getHandlers } = useActivePoint();
  const scale = buildScale(points.flatMap((point) => [point.value, point.previous_value]));
  const activePoint = activeIndex === null ? null : points[activeIndex];

  return (
    <ChartFrame label={label} points={points} activeIndex={activeIndex} formatValue={formatValue}>
      <Grid scale={scale} />
      <path
        d={buildPath(
          points.map((point) => point.previous_value),
          scale.toY,
        )}
        css={scoped(styles.previousLine)}
      />
      <path
        d={buildPath(
          points.map((point) => point.value),
          scale.toY,
        )}
        css={scoped(styles.line)}
      />
      {activeIndex !== null && (
        <line
          x1={getSlotCenter(activeIndex, points.length)}
          x2={getSlotCenter(activeIndex, points.length)}
          y1={PLOT_TOP}
          y2={PLOT_BOTTOM}
          css={scoped(styles.crosshair)}
        />
      )}
      {activeIndex !== null && typeof activePoint?.value === 'number' && (
        <circle
          cx={getSlotCenter(activeIndex, points.length)}
          cy={scale.toY(activePoint.value)}
          r={4}
          css={scoped(styles.activeDot)}
        />
      )}
      <AxisLabels points={points} />
      <HitAreas points={points} formatValue={formatValue} getHandlers={getHandlers} />
    </ChartFrame>
  );
};

LineChart.displayName = 'LineChart';

export default LineChart;

const styles = defineStyles({
  line: {
    fill: 'none',
    stroke: theme.colors.analytics.chart.primary,
    strokeWidth: 2,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
    vectorEffect: 'non-scaling-stroke',
  },
  previousLine: {
    fill: 'none',
    stroke: theme.colors.analytics.chart.previous,
    strokeWidth: 2,
    strokeDasharray: '4 4',
    vectorEffect: 'non-scaling-stroke',
  },
  crosshair: {
    stroke: theme.colors.analytics.chart.crosshair,
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke',
  },
  activeDot: {
    fill: theme.colors.analytics.chart.primary,
    stroke: theme.colors.background.surface,
    strokeWidth: 2,
  },
});
