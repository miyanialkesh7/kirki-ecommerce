import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import { pillStyles, type Tone, toneStyles } from '@/features/analytics/components/tone-styles';
import { type ChangeDirection, getChangeBadge } from '@/features/analytics/lib/change';
import { mergeCss, scoped } from '@/theme/mixins';

type ChangeBadgeProps = {
  change: number | null | undefined;
};

const TONES: Record<ChangeDirection, Tone> = {
  up: 'success',
  down: 'critical',
  flat: 'neutral',
};

const ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
} as const;

const ChangeBadge = (props: ChangeBadgeProps) => {
  const badge = getChangeBadge(props.change);

  if (!badge) {
    return null;
  }

  const Icon = ICONS[badge.direction];
  const tone = TONES[badge.direction];

  return (
    <span
      data-testid="change-badge"
      data-direction={badge.direction}
      data-tone={tone}
      css={scoped(mergeCss(pillStyles, toneStyles[tone]))}
    >
      <Icon size={12} aria-hidden="true" />
      {badge.text}
    </span>
  );
};

ChangeBadge.displayName = 'ChangeBadge';

export default ChangeBadge;
