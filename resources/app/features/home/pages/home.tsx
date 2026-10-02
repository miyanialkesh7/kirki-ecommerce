import { Eye } from 'lucide-react';

import Button from '@/components/ui/button';
import Flex from '@/components/ui/flex';
import { Page, PageContent, PageHeading } from '@/components/ui/page';
import SetupChecklist from '@/features/home/components/setup-checklist';
import TemplateGallery from '@/features/home/components/template-gallery';
import { theme } from '@/theme';
import { scoped } from '@/theme/mixins';
import { __ } from '@/wpi18n';

const Home = () => {
  return (
    <div css={scoped({ marginTop: theme.spacing[10] })}>
      <Page containerSize="sm">
        <PageHeading
          text={__('Let’s get you started', 'kirki-ecommerce')}
          actions={
            <Button variant="ghost" asChild>
              <a href={window.kirki_ecommerce.site_url} target="_blank" rel="noopener noreferrer">
                <Eye size={16} aria-hidden="true" />
                {__('View Live Site', 'kirki-ecommerce')}
              </a>
            </Button>
          }
        />
        <PageContent>
          <Flex direction="column" gap={4}>
            <SetupChecklist />
            <TemplateGallery />
          </Flex>
        </PageContent>
      </Page>
    </div>
  );
};

Home.displayName = 'Home';

export default Home;
