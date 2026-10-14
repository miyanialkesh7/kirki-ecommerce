import { describe, expect, it } from 'vitest';

import { ApiConfigurationFormSchema } from '@/features/settings/multi-currency/schemas/forms/api-configuration-form';

describe('ApiConfigurationFormSchema', () => {
  it('produces the exact payload', () => {
    const result = ApiConfigurationFormSchema.parse({
      api_key: 'secret-key',
      update_frequency: 'every_1_hour',
      fallback_behaviour: 'last_known_rate',
    });
    expect(result).toEqual({
      api_key: 'secret-key',
      update_frequency: 'every_1_hour',
      fallback_behaviour: 'last_known_rate',
    });
  });

  it('rejects a missing update frequency', () => {
    expect(
      ApiConfigurationFormSchema.safeParse({
        api_key: '',
        update_frequency: '',
        fallback_behaviour: 'base_currency',
      }).success,
    ).toBe(false);
  });

  it('accepts a missing fallback behaviour, which the dialog no longer shows', () => {
    const result = ApiConfigurationFormSchema.parse({
      api_key: 'secret-key',
      update_frequency: 'every_1_hour',
      fallback_behaviour: null,
    });
    expect(result.fallback_behaviour).toBeNull();
  });
});
