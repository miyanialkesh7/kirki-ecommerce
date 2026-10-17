import type { ReactNode } from 'react';

import {
  type ActivePointHandlers,
  CHART_HEIGHT,
  CHART_WIDTH,
  type ChartPoint,
  type ChartScale,
  formatPointValue,
  getSlotCenter,
  getSlotWidth,
  GRID_LINES,
  PLOT_LEFT,
  PLOT_RIGHT,
} from '@/features/analytics/components/charts/chart-geometry';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';

type HitAreasProps = {
  points: ChartPoint[];
  formatValue: (value: number) => string;
  getHandlers: ActivePointHandlers;
};

const HitAreas = (props: HitAreasProps) => {
  const { points, formatValue, getHandlers } = props;
  const slotWidth = getSlotWidth(points.length);

  return (
    <>
      {points.map((point, index) => (
        <rect
          key={point.date}
          data-testid={`chart-point-${index}`}
          role="img"
          tabIndex={0}
          aria-label={`${point.label}: ${formatPointValue(point.value, formatValue)}`}
          x={PLOT_LEFT + slotWidth * index}
          y={0}
          width={slotWidth}
          height={CHART_HEIGHT}
          css={scoped(styles.hitArea)}
          {...getHandlers(index)}
        />
      ))}
    </>
  );
};

HitAreas.displayName = 'HitAreas';

type GridProps = {
  scale: ChartScale;
};

const Grid = (props: GridProps) => {
  const { scale } = props;
  const lines = Array.from({ length: GRID_LINES + 1 }, (_, index) => {
    const value = scale.min + ((scale.max - scale.min) / GRID_LINES) * index;
    return scale.toY(value);
  });
  const baseline = scale.toY(0);

  return (
    <g aria-hidden="true">
      {lines.map((y) => (
        <line
          key={y}
          x1={PLOT_LEFT}
          x2={PLOT_RIGHT}
          y1={y}
          y2={y}
          css={scoped(styles.gridLine)}
        />
      ))}
      <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={baseline} y2={baseline} css={scoped(styles.baseLine)} />
    </g>
  );
};

Grid.displayName = 'Grid';

type AxisLabelsProps = {
  points: ChartPoint[];
};

const AxisLabels = (props: AxisLabelsProps) => {
  const { points } = props;

  if (points.length === 0) {
    return null;
  }

  const last = points.length - 1;

  return (
    <g aria-hidden="true">
      <text x={getSlotCenter(0, points.length)} y={CHART_HEIGHT - 8} textAnchor="start" css={scoped(styles.axisLabel)}>
        {points[0].label}
      </text>
      {last > 0 && (
        <text x={getSlotCenter(last, points.length)} y={CHART_HEIGHT - 8} textAnchor="end" css={scoped(styles.axisLabel)}>
          {points[last].label}
        </text>
      )}
    </g>
  );
};

AxisLabels.displayName = 'AxisLabels';

type ChartTooltipProps = {
  point: ChartPoint;
  index: number;
  count: number;
  formatValue: (value: number) => string;
  segmentNames?: string[];
};

const ChartTooltip = (props: ChartTooltipProps) => {
  const { point, index, count, formatValue, segmentNames } = props;
  const left = (getSlotCenter(index, count) / CHART_WIDTH) * 100;
  const hasComparison = point.previous_value !== null && point.previous_value !== undefined;

  return (
    <div role="tooltip" css={scoped(styles.tooltip)} style={{ left: `${left}%` }}>
      <span css={scoped(styles.tooltipLabel)}>{point.label}</span>
      <TooltipValues
        value={point.value}
        segments={point.segments}
        segmentNames={segmentNames}
        formatValue={formatValue}
      />
      {hasComparison && (
        <>
          <span css={scoped(styles.tooltipLabel)}>{point.previous_label}</span>
          <TooltipValues
            value={point.previous_value}
            segments={point.previous_segments}
            segmentNames={segmentNames}
            formatValue={formatValue}
          />
        </>
      )}
    </div>
  );
};

ChartTooltip.displayName = 'ChartTooltip';

type TooltipValuesProps = {
  value: number | null | undefined;
  segments?: number[];
  segmentNames?: string[];
  formatValue: (value: number) => string;
};

const TooltipValues = (props: TooltipValuesProps) => {
  const { value, segments, segmentNames, formatValue } = props;

  if (segments && segmentNames) {
    return (
      <>
        {segments.map((segment, position) => (
          <span key={segmentNames[position]} css={scoped(styles.tooltipValue)}>
            {segmentNames[position]}: {formatValue(segment)}
          </span>
        ))}
      </>
    );
  }

  return <span css={scoped(styles.tooltipValue)}>{formatPointValue(value, formatValue)}</span>;
};

TooltipValues.displayName = 'TooltipValues';

type ChartFrameProps = {
  label: string;
  points: ChartPoint[];
  activeIndex: number | null;
  formatValue: (value: number) => string;
  segmentNames?: string[];
  children: ReactNode;
};

const ChartFrame = (props: ChartFrameProps) => {
  const { label, points, activeIndex, formatValue, segmentNames, children } = props;
  const activePoint = activeIndex === null ? null : points[activeIndex];

  return (
    <div css={scoped(styles.frame)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        css={scoped(styles.svg)}
      >
        {children}
      </svg>
      {activePoint && activeIndex !== null && (
        <ChartTooltip
          point={activePoint}
          index={activeIndex}
          count={points.length}
          formatValue={formatValue}
          segmentNames={segmentNames}
        />
      )}
    </div>
  );
};

ChartFrame.displayName = 'ChartFrame';

export { AxisLabels, ChartFrame, Grid, HitAreas };

const styles = defineStyles({
  frame: {
    position: 'relative',
    width: '100%',
  },
  svg: {
    display: 'block',
    width: '100%',
    height: '220px',
    overflow: 'visible',
  },
  hitArea: {
    fill: 'transparent',
    outline: 'none',
    cursor: 'crosshair',
    '&:focus-visible': {
      fill: theme.colors.analytics.chart.grid,
    },
  },
  gridLine: {
    stroke: theme.colors.analytics.chart.grid,
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke',
  },
  baseLine: {
    stroke: theme.colors.analytics.chart.gridBase,
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke',
  },
  axisLabel: {
    fill: theme.colors.text.subdued,
    fontSize: '11px',
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.analytics.chart.tooltip,
    color: theme.colors.text.light,
    pointerEvents: 'none',
    zIndex: theme.zIndex.sticky,
    whiteSpace: 'nowrap',
    ...theme.typography.tiny(),
  },
  tooltipLabel: {
    ...theme.typography.tiny('semibold'),
    opacity: 0.72,
  },
  tooltipValue: {
    ...theme.typography.tiny('semibold'),
  },
});
