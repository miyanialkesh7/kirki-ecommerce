import { ArrowDown, ArrowUp, Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { pillStyles, type Tone, toneStyles } from '@/features/analytics/components/tone-styles';
import { type ChangeDirection, getChangeBadge } from '@/features/analytics/lib/change';
import { theme } from '@/theme';
import { defineStyles, mergeCss, scoped } from '@/theme/mixins';

type ChangeBadgeProps = {
  change: number | null | undefined;
  variant?: 'pill' | 'text';
};

const TONES: Record<ChangeDirection, Tone> = {
  up: 'success',
  down: 'critical',
  flat: 'neutral',
};

const ICONS = {
  pill: { up: ArrowUp, down: ArrowDown, flat: Minus },
  text: { up: TrendingUp, down: TrendingDown, flat: Minus },
} as const;

const ChangeBadge = (props: ChangeBadgeProps) => {
  const { change, variant = 'pill' } = props;
  const badge = getChangeBadge(change);

  if (!badge) {
    return null;
  }

  const Icon = ICONS[variant][badge.direction];
  const tone = TONES[badge.direction];
  const css =
    variant === 'text'
      ? mergeCss(styles.text, styles.tones[tone])
      : mergeCss(pillStyles, toneStyles[tone]);

  return (
    <span
      data-testid="change-badge"
      data-direction={badge.direction}
      data-tone={tone}
      css={scoped(css)}
    >
      <Icon size={variant === 'text' ? 16 : 12} aria-hidden="true" />
      {badge.text}
    </span>
  );
};

ChangeBadge.displayName = 'ChangeBadge';

export default ChangeBadge;

const styles = defineStyles({
  text: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    whiteSpace: 'nowrap',
    ...theme.typography.small('medium'),
  },
  tones: {
    success: { color: theme.colors.text.success },
    critical: { color: theme.colors.text.critical },
    neutral: { color: theme.colors.text.subdued },
    warning: { color: theme.colors.text.warning },
  },
});
