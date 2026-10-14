import { z } from 'zod';

import { OrderListItemSchema } from '@/features/orders';
import { MoneyObjectSchema } from '@/schemas/shared/api';
import { MediaRefSchema } from '@/schemas/shared/media';

const DashboardMetricsSchema = z.object({
  base_total_sales_money_object: MoneyObjectSchema,
  base_net_sales_money_object: MoneyObjectSchema,
  orders_count: z.number(),
  products_sold: z.number(),
});

const TopProductAvailabilitySchema = z.enum([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'partially_stocked',
]);

const TopProductSchema = z.object({
  product_id: z.number().nullable(),
  product_name: z.string().nullish(),
  image: MediaRefSchema.nullish(),
  units_sold: z.number(),
  base_revenue_money_object: MoneyObjectSchema,
  availability_status: TopProductAvailabilitySchema.nullable(),
  track_inventory: z.boolean(),
  inventory: z.number(),
});

const DashboardOverviewSchema = z.object({
  metrics: DashboardMetricsSchema,
  recent_orders: z.array(OrderListItemSchema),
  top_products: z.array(TopProductSchema),
});

type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
type TopProduct = z.infer<typeof TopProductSchema>;
type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;

export { type DashboardMetrics, type DashboardOverview, DashboardOverviewSchema, type TopProduct };
