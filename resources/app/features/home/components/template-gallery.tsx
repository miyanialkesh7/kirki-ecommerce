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
                height="220px"
                fit="cover"
              />
              <Flex direction="column" cssOverride={styles.meta}>
                <Text variant="small" weight="medium">
                  {template.name}
                </Text>
                <Text variant="small" color="subdued">
                  {template.author}
                </Text>
              </Flex>
            </Card>
          </a>
        ))}
      </div>
      <Button variant="link" asChild>
        <a href={STORE_TEMPLATES_EXPLORE_URL} target="_blank" rel="noopener noreferrer">
          {__('Explore more', 'kirki-ecommerce')}
        </a>
      </Button>
    </Flex>
  );
};

TemplateGallery.displayName = 'TemplateGallery';

export default TemplateGallery;

const styles = defineStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: theme.spacing[4],
    width: '100%',
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  meta: {
    padding: `${theme.spacing[3]} ${theme.spacing[3]}`,
  },
});
