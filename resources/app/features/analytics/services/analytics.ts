import { useQuery } from '@tanstack/react-query';

import { endpoints } from '@/config/endpoints';
import type { AnalyticsParams } from '@/features/analytics/lib/url-state';
import { AnalyticsOverviewSchema } from '@/features/analytics/schemas/catalog/analytics';
import { apiClient } from '@/libs/api';
import { parseData } from '@/services/helpers';

const analyticsKeys = {
  overview: (params: AnalyticsParams) => ['AnalyticsOverview', params] as const,
};

const buildQuery = (params: AnalyticsParams) => {
  const query: Record<string, string> = { range: params.range, compare: params.compare };

  if (params.range === 'custom' && params.from && params.to) {
    query.from = params.from;
    query.to = params.to;
  }

  if (params.compare === 'custom' && params.compare_from && params.compare_to) {
    query.compare_from = params.compare_from;
    query.compare_to = params.compare_to;
  }

  return query;
};

const getAnalyticsOverview = (params: AnalyticsParams) => {
  return apiClient
    .get(endpoints.ANALYTICS_OVERVIEW, { params: buildQuery(params) })
    .then((response) => parseData(AnalyticsOverviewSchema, response));
};

const useAnalyticsOverviewQuery = (params: AnalyticsParams) => {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => getAnalyticsOverview(params),
    staleTime: 0,
  });
};

export { useAnalyticsOverviewQuery };
