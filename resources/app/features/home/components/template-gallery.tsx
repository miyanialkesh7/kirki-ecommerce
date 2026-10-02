import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Flex from '@/components/ui/flex';
import Image from '@/components/ui/image';
import Text from '@/components/ui/text';
import { getStoreTemplates, STORE_TEMPLATES_EXPLORE_URL } from '@/features/home/lib/templates';
import { theme } from '@/theme';
import { defineStyles, scoped } from '@/theme/mixins';
import { __ } from '@/wpi18n';

const TemplateGallery = () => {
  return (
    <Flex direction="column" align="center" gap={6}>
      <div css={scoped(styles.grid)}>
        {getStoreTemplates().map((template) => (
          <a
            key={template.name}
            href={template.url}
            target="_blank"
            rel="noopener noreferrer"
            css={scoped(styles.link)}
          >
            <Card cssOverride={styles.card}>
              <Image
                src={template.image}
                alt={template.name}
                width="100%"
                height={TEMPLATE_IMAGE_HEIGHT}
                fit="cover"
                cssOverride={styles.image}
              />
              <Flex direction="column" cssOverride={styles.meta}>
                <Text variant="small" weight="medium" truncate>
                  {template.name}
                </Text>
                <Text color="subdued" truncate cssOverride={{ fontSize: '10px' }}>
                  {template.author}
                </Text>
              </Flex>
            </Card>
          </a>
        ))}
      </div>
      <Button variant="link" asChild cssOverride={{ color: theme.colors.text.emphasis }}>
        <a href={STORE_TEMPLATES_EXPLORE_URL} target="_blank" rel="noopener noreferrer">
          {__('Explore more', 'kirki-ecommerce')}
        </a>
      </Button>
    </Flex>
  );
};

TemplateGallery.displayName = 'TemplateGallery';

export default TemplateGallery;

const TEMPLATE_CARD_SIZE = '196px';
const TEMPLATE_IMAGE_HEIGHT = '140px';

const styles = defineStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: theme.spacing[2],
    width: '100%',
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    pointerEvents: 'none',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    width: TEMPLATE_CARD_SIZE,
    height: TEMPLATE_CARD_SIZE,
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  image: {
    border: 'none',
    borderRadius: 0,
  },
  meta: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    borderTop: `1px solid ${theme.colors.border.default}`,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
  },
});
