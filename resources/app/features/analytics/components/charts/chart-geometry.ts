import { type FocusEvent, type MouseEvent, useCallback, useState } from 'react';

import { EMPTY_VALUE } from '@/features/analytics/lib/format';

type ChartPoint = {
  date: string;
  label: string;
  value: number | null;
  previous_label?: string | null;
  previous_value?: number | null;
  segments?: number[];
  previous_segments?: number[];
};

type ChartProps = {
  label: string;
  points: ChartPoint[];
  formatValue?: (value: number) => string;
};

type ChartScale = {
  min: number;
  max: number;
  toY: (value: number) => number;
};

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PLOT_TOP = 12;
const PLOT_BOTTOM = CHART_HEIGHT - 28;
const PLOT_LEFT = 12;
const PLOT_RIGHT = CHART_WIDTH - 12;
const GRID_LINES = 4;

const defaultFormatValue = (value: number) => String(value);

const formatPointValue = (value: number | null | undefined, format: (value: number) => string) => {
  return value === null || value === undefined ? EMPTY_VALUE : format(value);
};

const buildScale = (values: (number | null | undefined)[]): ChartScale => {
  const numbers = values.filter((value): value is number => typeof value === 'number');
  const min = Math.min(0, ...numbers);
  const max = Math.max(0, ...numbers);
  const span = max - min || 1;

  return {
    min,
    max,
    toY: (value) => PLOT_BOTTOM - ((value - min) / span) * (PLOT_BOTTOM - PLOT_TOP),
  };
};

const getSlotWidth = (count: number) => (PLOT_RIGHT - PLOT_LEFT) / Math.max(count, 1);

const getSlotCenter = (index: number, count: number) => {
  return PLOT_LEFT + getSlotWidth(count) * (index + 0.5);
};

const useActivePoint = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getHandlers = useCallback((index: number) => {
    return {
      onMouseOver: (_event: MouseEvent) => setActiveIndex(index),
      onMouseOut: (_event: MouseEvent) => setActiveIndex(null),
      onFocus: (_event: FocusEvent) => setActiveIndex(index),
      onBlur: (_event: FocusEvent) => setActiveIndex(null),
    };
  }, []);

  return { activeIndex, getHandlers };
};


type ActivePointHandlers = ReturnType<typeof useActivePoint>['getHandlers'];

export {
  buildScale,
  CHART_HEIGHT,
  CHART_WIDTH,
  defaultFormatValue,
  formatPointValue,
  getSlotCenter,
  getSlotWidth,
  GRID_LINES,
  PLOT_BOTTOM,
  PLOT_LEFT,
  PLOT_RIGHT,
  PLOT_TOP,
  useActivePoint,
};
export type { ActivePointHandlers, ChartPoint, ChartProps, ChartScale };
