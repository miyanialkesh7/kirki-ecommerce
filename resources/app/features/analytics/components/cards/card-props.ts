import type { AnalyticsCards } from '@/features/analytics/schemas/catalog/analytics';

type CardProps<Key extends keyof AnalyticsCards> = {
  data: AnalyticsCards[Key];
  isEmpty: boolean;
  formatMinor: (minorAmount: number) => string;
};

export type { CardProps };
