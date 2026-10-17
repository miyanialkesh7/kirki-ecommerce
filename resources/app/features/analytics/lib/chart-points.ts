import type { ChartPoint } from '@/features/analytics/components/charts/chart-geometry';
import type { SeriesPoint } from '@/features/analytics/schemas/catalog/analytics';

const toChartPoints = (series: SeriesPoint[]): ChartPoint[] => {
  return series.map((point) => ({
    date: point.date,
    label: point.label,
    value: point.value ?? null,
    previous_label: point.previous_label,
    previous_value: point.previous_value,
  }));
};

const hasNoSeriesValues = (series: SeriesPoint[]) => {
  return series.every((point) => !point.value);
};

export { hasNoSeriesValues, toChartPoints };
