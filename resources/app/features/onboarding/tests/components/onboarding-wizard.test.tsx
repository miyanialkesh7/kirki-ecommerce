import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import OnboardingWizard from '@/features/onboarding/components/onboarding-wizard';

vi.mock('@/features/onboarding/services/onboarding', () => ({
  useCreateStoreMutation: () => ({ isPending: false, mutate: vi.fn() }),
  useLoadSampleDataMutation: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock('@/features/settings', () => ({
  useAllCurrenciesQuery: () => ({ data: [] }),
}));

vi.mock('@/services/country', () => ({
  useCountriesQuery: () => ({ data: [] }),
}));

describe('onboarding wizard', () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it('clears a step error as soon as the field is corrected', async () => {
    render(
      <MemoryRouter>
        <OnboardingWizard />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Store name is required')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Your Store Name'), { target: { value: 'Acme' } });

    await waitFor(() => {
      expect(screen.queryByText('Store name is required')).not.toBeInTheDocument();
    });
  });
});
