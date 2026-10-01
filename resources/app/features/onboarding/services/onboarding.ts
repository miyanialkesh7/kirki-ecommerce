import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { endpoints } from '@/config/endpoints';
import { clearDraft } from '@/features/onboarding/lib/onboarding-draft';
import { markOnboarded } from '@/features/onboarding/lib/onboarding-status';
import { withMinimumDuration } from '@/features/onboarding/lib/with-minimum-duration';
import { StoreSetupSummarySchema } from '@/features/onboarding/schemas/catalog/store-setup';
import type { OnboardingFormPayload } from '@/features/onboarding/schemas/forms/onboarding-form';
import { apiClient } from '@/libs/api';
import { parseResponse, toastMutationError, toastMutationSuccess } from '@/services/helpers';
import { __ } from '@/wpi18n';

// Keeps the completion screen's progress rows visible for a beat even when setup is
// quick; slower setups (e.g. future industry presets) are followed as they are.
const MIN_STORE_SETUP_MS = 300;

const createStore = (data: OnboardingFormPayload) => {
  return withMinimumDuration(
    apiClient
      .post(endpoints.ONBOARDING, data)
      .then((response) => parseResponse(StoreSetupSummarySchema, response)),
    MIN_STORE_SETUP_MS,
  );
};

const loadSampleData = () => {
  return apiClient
    .post(endpoints.ONBOARDING_SAMPLE_DATA)
    .then((response) => parseResponse(z.unknown(), response));
};

const useCreateStoreMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
    onSuccess() {
      clearDraft();
      markOnboarded();
      void queryClient.invalidateQueries();
    },
  });
};

const useLoadSampleDataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loadSampleData,
    onSuccess(response) {
      toastMutationSuccess(response.message || __('Sample data loaded', 'kirki-ecommerce'));
      void queryClient.invalidateQueries();
    },
    onError(error) {
      toastMutationError(error);
    },
  });
};

export { useCreateStoreMutation, useLoadSampleDataMutation };
