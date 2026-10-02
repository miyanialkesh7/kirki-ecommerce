import { __, sprintf } from '@/wpi18n';

type StoreTemplate = {
  name: string;
  author: string;
  image: string | null;
  url: string;
};

// TODO: Replace the placeholder images and links with the real template catalog.
const STORE_TEMPLATES_EXPLORE_URL = '#';

const getStoreTemplates = (): StoreTemplate[] => {
  const author = sprintf(__('By %s', 'kirki-ecommerce'), 'Kirki');

  return [
    { name: 'Dogolala', author, image: null, url: '#' },
    { name: 'Beauty Pie', author, image: null, url: '#' },
    { name: 'Kiddon', author, image: null, url: '#' },
  ];
};

export { getStoreTemplates, STORE_TEMPLATES_EXPLORE_URL };
