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

  it('goes back from step two with the Back button beside the title', async () => {
    render(
      <MemoryRouter>
        <OnboardingWizard />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Store name'), { target: { value: 'Acme' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Where do you sell from?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(await screen.findByText("Let's set up your store")).toBeInTheDocument();
  });
});
