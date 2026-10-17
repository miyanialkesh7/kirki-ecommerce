import Text from '@/components/ui/text';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';

type RankedListItem = {
  key: string;
  label: string;
  detail?: string;
  value: string;
};

type RankedListProps = {
  items: RankedListItem[];
};

const RankedList = (props: RankedListProps) => {
  const { items } = props;

  return (
    <ul css={scoped(styles.list)}>
      {items.map((item) => (
        <li key={item.key} css={scoped(styles.row)}>
          <div css={scoped(styles.text)}>
            <Text variant="small" weight="medium" truncate>
              {item.label}
            </Text>
            {item.detail && (
              <Text variant="tiny" color="subdued">
                {item.detail}
              </Text>
            )}
          </div>
          <Text variant="small" weight="semibold">
            {item.value}
          </Text>
        </li>
      ))}
    </ul>
  );
};

RankedList.displayName = 'RankedList';

export default RankedList;
export type { RankedListItem };

const styles = defineStyles({
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[3],
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing[3],
    margin: 0,
    minWidth: 0,
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
});
