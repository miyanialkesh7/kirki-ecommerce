import { Check, Minus } from 'lucide-react';

import Alert from '@/components/ui/alert';
import Button from '@/components/ui/button';
import Flex from '@/components/ui/flex';
import Spinner from '@/components/ui/spinner';
import Text from '@/components/ui/text';
import StepLayout from '@/features/onboarding/components/step-layout';
import { theme } from '@/theme';
import { defineStyles, scoped, scopedMerge } from '@/theme/mixins';
import { __ } from '@/wpi18n';

type SetupStatus = 'pending' | 'success' | 'error';

type SetupSummaryRow = {
  label: string;
  value: string;
};

type SetupCompleteStepProps = {
  status: SetupStatus;
  rows: SetupSummaryRow[];
  errorMessage?: string;
  isLoadingSampleData: boolean;
  onRetry: () => void;
  onGoToDashboard: () => void;
  onLoadSampleData: () => void;
};

const SetupCompleteStep = ({
  status,
  rows,
  errorMessage,
  isLoadingSampleData,
  onRetry,
  onGoToDashboard,
  onLoadSampleData,
}: SetupCompleteStepProps) => {
  const areActionsDisabled = status !== 'success' || isLoadingSampleData;

  return (
    <StepLayout
      title={__('Your store is ready', 'kirki-ecommerce')}
      subtitle={__("Here's what we set up for you.", 'kirki-ecommerce')}
      footer={
        status === 'error' ? (
          <Button size="lg" onClick={onRetry}>
            {__('Try again', 'kirki-ecommerce')}
          </Button>
        ) : (
          <>
            <Button size="lg" onClick={onGoToDashboard} disabled={areActionsDisabled}>
              {__('Go to dashboard', 'kirki-ecommerce')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onLoadSampleData}
              disabled={status !== 'success'}
              loading={isLoadingSampleData}
            >
              {__('Load sample data', 'kirki-ecommerce')}
            </Button>
            <Text variant="small" color="subdued" cssOverride={styles.note}>
              {__('Explore with demo products, orders & settings.', 'kirki-ecommerce')}
            </Text>
          </>
        )
      }
    >
      <Flex direction="column" gap={2}>
        {rows.map((row) => (
          <Flex key={row.label} gap={3} align="center">
            <SetupRowIcon status={status} />
            <Text weight="medium" cssOverride={styles.rowLabel}>
              {row.label}
            </Text>
            <Text color="subdued">·</Text>
            <Text color="subdued">{row.value}</Text>
          </Flex>
        ))}
      </Flex>
      {status === 'error' && (
        <Alert type="fail" text={errorMessage ?? __('Store setup failed.', 'kirki-ecommerce')} />
      )}
    </StepLayout>
  );
};

SetupCompleteStep.displayName = 'SetupCompleteStep';

const SetupRowIcon = ({ status }: { status: SetupStatus }) => {
  if (status === 'pending') {
    return (
      <span css={scoped(styles.icon)}>
        <Spinner cssOverride={styles.spinner} />
      </span>
    );
  }

  if (status === 'success') {
    return (
      <span css={scopedMerge(styles.icon, styles.success)}>
        <Check size={12} strokeWidth={3} />
      </span>
    );
  }

  return (
    <span css={scopedMerge(styles.icon, styles.idle)}>
      <Minus size={12} strokeWidth={3} />
    </span>
  );
};

SetupRowIcon.displayName = 'SetupRowIcon';

export default SetupCompleteStep;
export type { SetupStatus, SetupSummaryRow };

const styles = defineStyles({
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '24px',
    height: '24px',
    borderRadius: theme.radius.full,
  },
  rowLabel: {
    whiteSpace: 'nowrap',
  },
  spinner: {
    width: '20px',
    height: '20px',
    color: theme.colors.icon.brand,
    '& svg': {
      width: '20px',
      height: '20px',
    },
  },
  success: {
    backgroundColor: theme.colors.background.fillSuccessSecondary,
    color: theme.colors.icon.success,
  },
  idle: {
    backgroundColor: theme.colors.background.surfaceSecondary,
    color: theme.colors.icon.secondary,
  },
  note: {
    textAlign: 'center',
  },
});
