import type { OnboardingFormInput } from '@/features/onboarding/schemas/forms/onboarding-form';
import { __ } from '@/wpi18n';

type OnboardingStep = 0 | 1 | 2 | 3 | 4;

const TAX_STEP = 3 as const;

const COMPLETION_STEP = 4 as const;

const STEP_FIELDS: Record<Exclude<OnboardingStep, 4>, (keyof OnboardingFormInput)[]> = {
  0: ['store_name', 'industry'],
  1: ['country', 'store_address'],
  2: ['currency', 'is_tax_collected'],
  3: ['is_tax_inclusive_price', 'store_tax_id'],
};

const getFormStepCount = (isTaxCollected: boolean) => (isTaxCollected ? 4 : 3);

const getStepTitle = (step: OnboardingStep): string => {
  const titles: Record<OnboardingStep, string> = {
    0: __('Store Basics', 'kirki-ecommerce'),
    1: __('Business Info', 'kirki-ecommerce'),
    2: __('Essentials', 'kirki-ecommerce'),
    3: __('Store Tax', 'kirki-ecommerce'),
    4: __('Setup Complete', 'kirki-ecommerce'),
  };

  return titles[step];
};

const getIndustryOptions = () => [
  { value: 'clothing-and-accessories', label: __('Clothing and accessories', 'kirki-ecommerce') },
  { value: 'food-and-drink', label: __('Food and drink', 'kirki-ecommerce') },
  { value: 'electronics-and-computers', label: __('Electronics and computers', 'kirki-ecommerce') },
  { value: 'health-and-beauty', label: __('Health and beauty', 'kirki-ecommerce') },
  { value: 'education-and-learning', label: __('Education and learning', 'kirki-ecommerce') },
  { value: 'home-furniture-and-garden', label: __('Home, furniture and garden', 'kirki-ecommerce') },
  { value: 'arts-and-crafts', label: __('Arts and crafts', 'kirki-ecommerce') },
  { value: 'sports-and-recreation', label: __('Sports and recreation', 'kirki-ecommerce') },
  { value: 'other', label: __('Other', 'kirki-ecommerce') },
];

export {
  COMPLETION_STEP,
  getFormStepCount,
  getIndustryOptions,
  getStepTitle,
  type OnboardingStep,
  STEP_FIELDS,
  TAX_STEP,
};
