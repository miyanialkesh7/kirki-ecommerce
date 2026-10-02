import { Info } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import TextField from '@/components/form/text-field';
import Button from '@/components/ui/button';
import Flex from '@/components/ui/flex';
import Grid from '@/components/ui/grid';
import Text from '@/components/ui/text';
import ChoiceButtonsField from '@/features/onboarding/components/fields/choice-buttons-field';
import CurrencyField from '@/features/onboarding/components/fields/currency-field';
import StepLayout from '@/features/onboarding/components/step-layout';
import type { OnboardingFormInput } from '@/features/onboarding/schemas/forms/onboarding-form';
import { useAllCurrenciesQuery } from '@/features/settings';
import { useCountriesQuery } from '@/services/country';
import { theme } from '@/theme';
import { defineStyles } from '@/theme/mixins';
import { __ } from '@/wpi18n';

type EssentialsStepProps = {
  onBack: () => void;
  onCreateStore: () => void;
};

const EssentialsStep = ({ onBack, onCreateStore }: EssentialsStepProps) => {
  const { getValues, setValue } = useFormContext<OnboardingFormInput>();
  const isTaxCollected = useWatch<OnboardingFormInput, 'is_tax_collected'>({
    name: 'is_tax_collected',
  });
  const { data: countries = [] } = useCountriesQuery({ limit: -1 });
  const { data: currencies = [] } = useAllCurrenciesQuery();
  const hasAttemptedPreselection = useRef(false);

  useEffect(() => {
    if (hasAttemptedPreselection.current || countries.length === 0 || currencies.length === 0) {
      return;
    }

    hasAttemptedPreselection.current = true;

    if (getValues('currency')) {
      return;
    }

    const countryCurrency = countries.find((item) => item.code === getValues('country'))?.currency;
    const isKnownCurrency = currencies.some((currency) => currency.code === countryCurrency);

    if (countryCurrency && isKnownCurrency) {
      setValue('currency', countryCurrency, { shouldDirty: true });
    }
  }, [countries, currencies, getValues, setValue]);

  return (
    <StepLayout
      title={__('Setup the essentials', 'kirki-ecommerce')}
      footer={
        <>
          <Flex gap={2} align="center" cssOverride={styles.note}>
            <Info size={16} aria-hidden="true" />
            <Text variant="small" color="secondary">
              {__('Shop, Cart, Checkout and Account pages will be created', 'kirki-ecommerce')}
            </Text>
          </Flex>
          <Grid columns={2} gap={3}>
            <Button variant="outline" size="lg" onClick={onBack}>
              {__('Back', 'kirki-ecommerce')}
            </Button>
            <Button size="lg" onClick={onCreateStore}>
              {__('Create Store', 'kirki-ecommerce')}
            </Button>
          </Grid>
        </>
      }
    >
      <CurrencyField name="currency" />
      <ChoiceButtonsField
        name="is_tax_collected"
        label={__('Collect sales tax?', 'kirki-ecommerce')}
        options={[
          { value: true, label: __('Yes', 'kirki-ecommerce') },
          { value: false, label: __('No, not yet', 'kirki-ecommerce') },
        ]}
      />
      {isTaxCollected && (
        <>
          <ChoiceButtonsField
            name="is_tax_inclusive_price"
            label={__('Prices on your storefront', 'kirki-ecommerce')}
            options={[
              { value: false, label: __('Tax added at checkout', 'kirki-ecommerce') },
              { value: true, label: __('Tax included in price', 'kirki-ecommerce') },
            ]}
          />
          <TextField
            name="store_tax_id"
            label={__('Tax ID (optional)', 'kirki-ecommerce')}
            placeholder={__('Permit or VAT number', 'kirki-ecommerce')}
            infoText={__('The Tax ID prints on your invoices.', 'kirki-ecommerce')}
          />
        </>
      )}
    </StepLayout>
  );
};

EssentialsStep.displayName = 'EssentialsStep';

export default EssentialsStep;

const styles = defineStyles({
  note: {
    padding: theme.spacing[2],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background.solidSurfaceAlt,
    color: theme.colors.icon.secondary,
  },
});
