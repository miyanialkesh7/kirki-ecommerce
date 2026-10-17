import { addDays, format, parseISO, subDays, subYears } from 'date-fns';

import { __ } from '@/wpi18n';

const RANGE_PRESETS = [
  'today',
  'yesterday',
  'last_7',
  'last_30',
  'last_90',
  'last_12_months',
  'month_to_date',
  'year_to_date',
] as const;

const COMPARISONS = ['previous_period', 'previous_year', 'custom', 'none'] as const;

type RangePreset = (typeof RANGE_PRESETS)[number];
type RangeKey = RangePreset | 'custom';
type CompareKey = (typeof COMPARISONS)[number];
type DayRange = { from: string; to: string };

const ISO_DAY = 'yyyy-MM-dd';

const getRangePresetLabel = (preset: RangeKey) => {
  const labels: Record<RangeKey, string> = {
    today: __('Today', 'kirki-ecommerce'),
    yesterday: __('Yesterday', 'kirki-ecommerce'),
    last_7: __('Last 7 days', 'kirki-ecommerce'),
    last_30: __('Last 30 days', 'kirki-ecommerce'),
    last_90: __('Last 90 days', 'kirki-ecommerce'),
    last_12_months: __('Last 12 months', 'kirki-ecommerce'),
    month_to_date: __('Month to date', 'kirki-ecommerce'),
    year_to_date: __('Year to date', 'kirki-ecommerce'),
    custom: __('Custom range', 'kirki-ecommerce'),
  };

  return labels[preset];
};

const getCompareLabel = (compare: CompareKey) => {
  const labels: Record<CompareKey, string> = {
    previous_period: __('Previous period', 'kirki-ecommerce'),
    previous_year: __('Previous year', 'kirki-ecommerce'),
    custom: __('Custom range', 'kirki-ecommerce'),
    none: __('No comparison', 'kirki-ecommerce'),
  };

  return labels[compare];
};

const resolvePresetRange = (preset: RangePreset, today: Date): DayRange => {
  const to = format(today, ISO_DAY);

  switch (preset) {
    case 'today':
      return { from: to, to };
    case 'yesterday': {
      const yesterday = format(subDays(today, 1), ISO_DAY);
      return { from: yesterday, to: yesterday };
    }
    case 'last_7':
      return { from: format(subDays(today, 6), ISO_DAY), to };
    case 'last_90':
      return { from: format(subDays(today, 89), ISO_DAY), to };
    case 'last_12_months':
      return { from: format(addDays(subYears(today, 1), 1), ISO_DAY), to };
    case 'month_to_date':
      return { from: format(today, 'yyyy-MM-01'), to };
    case 'year_to_date':
      return { from: format(today, 'yyyy-01-01'), to };
    default:
      return { from: format(subDays(today, 29), ISO_DAY), to };
  }
};

const formatRangeDates = (from: string, to: string) => {
  const start = parseISO(from);
  const end = parseISO(to);

  if (from === to) {
    return format(end, 'MMM d, yyyy');
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
};

export {
  COMPARISONS,
  formatRangeDates,
  getCompareLabel,
  getRangePresetLabel,
  RANGE_PRESETS,
  resolvePresetRange,
};
export type { CompareKey, DayRange, RangeKey, RangePreset };
