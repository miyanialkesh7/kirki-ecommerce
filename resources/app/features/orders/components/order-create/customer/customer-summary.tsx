import { Copy } from 'lucide-react';

import Button from '@/components/ui/button';
import Flex from '@/components/ui/flex';
import Image from '@/components/ui/image';
import Text from '@/components/ui/text';
import type { AddressLines } from '@/features/orders/lib/customer-address';
import { LocationIcon, PhoneIcon, TruckIcon } from '@/icons';
import type { MediaRef } from '@/schemas/shared/media';
import { theme } from '@/theme';
import { defineStyles, flexCenter, scoped } from '@/theme/mixins';
import { copyToClipboard } from '@/utils';
import { __ } from '@/wpi18n';

const handleCopyAddress = (address: AddressLines) => {
  void copyToClipboard([address.line1, address.line2].filter(Boolean).join(', '));
};

type CustomerSummaryProps = {
  name: string;
  email?: string | null;
  phone?: string | null;
  photo?: MediaRef | null;
  billingAddress?: AddressLines | null;
  shippingAddress?: AddressLines | null;
};

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

const CustomerSummary = ({
  name,
  email,
  phone,
  photo,
  billingAddress,
  shippingAddress,
}: CustomerSummaryProps) => {
  return (
    <Flex direction="column" gap={4}>
      <Flex gap={2} align="center">
        {photo?.url ? (
          <Image shape="circle" src={photo} alt={name} />
        ) : (
          <div css={scoped(styles.initialsAvatar)}>{getInitials(name)}</div>
        )}
        <Flex direction="column" gap={2}>
          <Text weight="medium">{name}</Text>
          {email && (
            <Text variant="small" color="secondary">
              {email}
            </Text>
          )}
        </Flex>
      </Flex>

      {phone && (
        <Flex gap={2} align="center">
          <span css={scoped(styles.iconSlot)}>
            <PhoneIcon />
          </span>
          <Text>{phone}</Text>
        </Flex>
      )}

      {billingAddress && (
        <Flex gap={2} align="flex-start">
          <span css={scoped(styles.iconSlot)}>
            <LocationIcon />
          </span>
          <Flex direction="column" gap={2} cssOverride={styles.addressContent}>
            <Text variant="small" color="subdued">
              {__('Billing Address', 'kirki-ecommerce')}
            </Text>
            <Text variant="small">
              {billingAddress.line1}
              <br />
              {billingAddress.line2}
            </Text>
          </Flex>
          <Button
            variant="ghost"
            size="icon"
            aria-label={__('Copy billing address', 'kirki-ecommerce')}
            onClick={() => handleCopyAddress(billingAddress)}
          >
            <Copy size={16} />
          </Button>
        </Flex>
      )}

      {shippingAddress && (
        <Flex gap={2} align="flex-start">
          <span css={scoped(styles.iconSlot)}>
            <TruckIcon style={{ opacity: 0.5 }} />
          </span>
          <Flex direction="column" gap={2} cssOverride={styles.addressContent}>
            <Text variant="small" color="subdued">
              {__('Shipping Address', 'kirki-ecommerce')}
            </Text>
            <Text variant="small">
              {shippingAddress.line1}
              <br />
              {shippingAddress.line2}
            </Text>
          </Flex>
          <Button
            variant="ghost"
            size="icon"
            aria-label={__('Copy shipping address', 'kirki-ecommerce')}
            onClick={() => handleCopyAddress(shippingAddress)}
          >
            <Copy size={16} />
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

CustomerSummary.displayName = 'CustomerSummary';

export default CustomerSummary;

const styles = defineStyles({
  addressContent: {
    flex: 1,
  },
  initialsAvatar: {
    ...flexCenter(),
    width: '40px',
    height: '40px',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.surfaceAlt,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    flexShrink: 0,
  },
  iconSlot: scoped(flexCenter()),
});
