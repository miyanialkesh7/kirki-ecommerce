import Text from '@/components/ui/text';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';

type HBarItem = {
  key: string;
  label: string;
  value: number;
  display: string;
  previousValue?: number | null;
  previousDisplay?: string | null;
};

type HBarListProps = {
  items: HBarItem[];
};

const toPercent = (value: number, max: number) => `${Math.max(0, (value / max) * 100)}%`;

const HBarList = (props: HBarListProps) => {
  const { items } = props;
  const max = Math.max(1, ...items.flatMap((item) => [item.value, item.previousValue ?? 0]));

  return (
    <ul css={scoped(styles.list)}>
      {items.map((item) => (
        <li key={item.key} css={scoped(styles.row)}>
          <div css={scoped(styles.header)}>
            <Text variant="small" truncate>
              {item.label}
            </Text>
            <Text variant="small" weight="semibold">
              {item.display}
            </Text>
          </div>
          <div css={scoped(styles.track)} aria-hidden="true">
            <div css={scoped(styles.bar)} style={{ width: toPercent(item.value, max) }} />
          </div>
          {item.previousDisplay && (
            <>
              <div css={scoped(styles.track)} aria-hidden="true">
                <div css={scoped(styles.previousBar)} style={{ width: toPercent(item.previousValue ?? 0, max) }} />
              </div>
              <Text variant="tiny" color="subdued">
                {item.previousDisplay}
              </Text>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

HBarList.displayName = 'HBarList';

export default HBarList;
export type { HBarItem };

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
    flexDirection: 'column',
    gap: theme.spacing[1],
    minWidth: 0,
    margin: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
    minWidth: 0,
  },
  track: {
    height: '6px',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.analytics.chart.grid,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.analytics.breakdown.bar,
  },
  previousBar: {
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.analytics.chart.previous,
  },
});
