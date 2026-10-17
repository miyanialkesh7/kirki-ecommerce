import Flex from '@/components/ui/flex';
import Text from '@/components/ui/text';
import ChangeBadge from '@/features/analytics/components/change-badge';

type CardHeadlineProps = {
  value: string;
  change?: number | null;
};

const CardHeadline = (props: CardHeadlineProps) => {
  const { value, change } = props;

  return (
    <Flex align="center" gap={2} wrap="wrap">
      <Text variant="heading4" weight="bold">
        {value}
      </Text>
      <ChangeBadge change={change} />
    </Flex>
  );
};

CardHeadline.displayName = 'CardHeadline';

export default CardHeadline;
