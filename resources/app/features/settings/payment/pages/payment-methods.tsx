import { CardSimIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

import DropdownButton from '@/components/dropdown-button';
import ActionGroup from '@/components/ui/action-group';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Flex from '@/components/ui/flex';
import Image from '@/components/ui/image';
import Switch from '@/components/ui/switch';
import Text from '@/components/ui/text';
import OfflinePaymentPopup from '@/features/settings/payment/pages/offline-payment-dialog';
import OnlinePaymentPopup from '@/features/settings/payment/pages/online-payment-dialog';
import OnlinePaymentEditPopup from '@/features/settings/payment/pages/online-payment-edit-dialog';
import type {
  OfflinePayment,
  OnlinePayment,
  PaymentMethod,
} from '@/features/settings/payment/schemas/catalog/payment';
import {
  getOnlinePayment,
  useDeleteOfflinePaymentMutation,
  useSetEnabledOnlinePaymentMutation,
  useUpdateOfflinePaymentMutation,
} from '@/features/settings/payment/services/payment';
import { useConfirmDelete } from '@/hooks';
import { BankIconLarge, CashIcon } from '@/icons';
import { theme } from '@/theme';
import { cardStyles } from '@/theme/card-styles';
import { defineStyles, mergeCss } from '@/theme/mixins';
import { dispatchToastMessage } from '@/utils/common';
import { __ } from '@/wpi18n';

type PaymentMethodsProps = {
  paymentMethods: PaymentMethod[];
};

const getIconUrl = (icon: PaymentMethod['icon']) => {
  if (typeof icon !== 'string') {
    return null;
  }

  return /^(https?:)?\/\//.test(icon) || icon.startsWith('/') ? icon : null;
};

const PaymentMethods = (props: PaymentMethodsProps) => {
  const { paymentMethods } = props;

  const [isOfflineDialogOpen, setIsOfflineDialogOpen] = useState(false);
  const [editingOfflineMethod, setEditingOfflineMethod] = useState<OfflinePayment | null>(null);
  const [isOnlineInstallDialogOpen, setIsOnlineInstallDialogOpen] = useState(false);
  const [isOnlineEditDialogOpen, setIsOnlineEditDialogOpen] = useState(false);
  const [editingOnlineMethod, setEditingOnlineMethod] = useState<OnlinePayment | null>(null);

  const { mutate: updateOfflinePayment } = useUpdateOfflinePaymentMutation();
  const { mutate: deleteOfflinePayment } = useDeleteOfflinePaymentMutation();
  const { mutate: setEnabledOnlinePayment } = useSetEnabledOnlinePaymentMutation();
  const { confirmDelete, deleteConfirmation } = useConfirmDelete();

  const handleToggle = (method: PaymentMethod) => {
    const isEnabled = Boolean(method.is_enabled);

    if (method.is_offline) {
      updateOfflinePayment({ id: method.id, data: { ...method, is_enabled: !isEnabled } });
      return;
    }

    setEnabledOnlinePayment({ id: method.id, data: { is_enabled: !isEnabled } });
  };

  const handleDelete = (method: PaymentMethod) => {
    if (method.is_offline) {
      confirmDelete(
        {
          title: __('Delete payment method?', 'kirki-ecommerce'),
          description: __(
            'Customers will no longer be able to choose this method at checkout. This cannot be undone.',
            'kirki-ecommerce',
          ),
        },
        () => {
          deleteOfflinePayment(method.id);
        },
      );
      return;
    }

    confirmDelete(
      {
        title: __('Delete payment gateway?', 'kirki-ecommerce'),
        description: __(
          'This gateway will be removed from your store and can no longer process payments. This cannot be undone.',
          'kirki-ecommerce',
        ),
      },
      () => {
        dispatchToastMessage('delete', {
          title: __('Payment gateway deleted', 'kirki-ecommerce'),
          duration: 5000,
        });
      },
    );
  };

  const handleEdit = async (method: PaymentMethod) => {
    if (method.is_offline) {
      setEditingOfflineMethod(method);
      setIsOfflineDialogOpen(true);
      return;
    }

    const onlineMethod = await getOnlinePayment(method.id);

    if (onlineMethod) {
      setEditingOnlineMethod(onlineMethod);
      setIsOnlineEditDialogOpen(true);
    }
  };

  const handleAction = (action: string | number | (string | number)[], method: PaymentMethod) => {
    if (action === 'edit') {
      void handleEdit(method);
    }

    if (action === 'delete') {
      handleDelete(method);
    }
  };

  const renderIcon = (method: PaymentMethod) => {
    const iconUrl = getIconUrl(method.icon);

    if (iconUrl) {
      return (
        <Image
          src={iconUrl}
          alt={__('Logo', 'kirki-ecommerce')}
          height={20}
          width={20}
          fit="contain"
          cssOverride={styles.icon}
        />
      );
    }

    return method.is_offline ? <BankIconLarge /> : <CardSimIcon size={20} />;
  };

  return (
    <>
      <Card
        data-search-id="payments.methods"
        data-search-keywords="cash on delivery, bank transfer, cheque, offline payment, payment gateways, stripe, paypal, credit card, digital wallet, processor"
        cssOverride={cardStyles.formCard}
      >
        <CardContent>
          <Flex direction="column" gap={4}>
            <Flex gap={2} align="flex-start">
              <Flex direction="column">
                <Text variant="heading6" weight="semibold" color="primary">
                  {__('Payment methods', 'kirki-ecommerce')}
                </Text>
                <Text variant="small" color="secondary">
                  {__("Set up and manage your online store's payment options.", 'kirki-ecommerce')}
                </Text>
              </Flex>
              <ActionGroup>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="primary" size="sm">
                      <PlusIcon />
                      {__('Add', 'kirki-ecommerce')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setIsOnlineInstallDialogOpen(true)}>
                      {__('Payment Gateways', 'kirki-ecommerce')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setEditingOfflineMethod(null);
                        setIsOfflineDialogOpen(true);
                      }}
                    >
                      {__('Manual Payment', 'kirki-ecommerce')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ActionGroup>
            </Flex>

            {paymentMethods.length === 0 ? (
              <Card cssOverride={cardStyles.innerDarkCard}>
                <CardContent
                  cssOverride={mergeCss(cardStyles.innerDarkContent, styles.emptyStateContent)}
                >
                  <Flex direction="column" gap={2} align="center">
                    <CashIcon />
                    <Text color="subdued">{__('No payment added yet', 'kirki-ecommerce')}</Text>
                  </Flex>
                </CardContent>
              </Card>
            ) : (
              <Flex direction="column" gap={2}>
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    cssOverride={mergeCss(cardStyles.innerCard, styles.methodCard)}
                  >
                    <CardContent cssOverride={mergeCss(cardStyles.innerContent, styles.methodRow)}>
                      <Flex align="center">
                        <Flex gap={2} align="center">
                          {renderIcon(method)}
                          <Text weight="medium" color="primary">
                            {method.name}
                          </Text>
                        </Flex>

                        <ActionGroup data-row-actions>
                          <Switch
                            checked={Boolean(method.is_enabled)}
                            onCheckedChange={() => handleToggle(method)}
                          />
                          <DropdownButton
                            dropdownStyle={{ width: '120px' }}
                            options={[
                              { title: __('Edit', 'kirki-ecommerce'), value: 'edit' },
                              { title: __('Delete', 'kirki-ecommerce'), value: 'delete' },
                            ]}
                            onOptionSelect={(action) => handleAction(action, method)}
                          />
                        </ActionGroup>
                      </Flex>
                    </CardContent>
                  </Card>
                ))}
              </Flex>
            )}
          </Flex>
        </CardContent>
      </Card>

      <OfflinePaymentPopup
        openPopup={isOfflineDialogOpen}
        setOpenPopup={setIsOfflineDialogOpen}
        editingMethod={editingOfflineMethod}
        setEditingMethod={setEditingOfflineMethod}
      />

      {isOnlineInstallDialogOpen && (
        <OnlinePaymentPopup
          openPopup={isOnlineInstallDialogOpen}
          setOpenPopup={setIsOnlineInstallDialogOpen}
        />
      )}

      <OnlinePaymentEditPopup
        editedItem={editingOnlineMethod}
        isOpen={isOnlineEditDialogOpen}
        onClose={() => setIsOnlineEditDialogOpen(false)}
      />
      {deleteConfirmation}
    </>
  );
};

PaymentMethods.displayName = 'PaymentMethods';

export default PaymentMethods;

const styles = defineStyles({
  methodCard: {
    borderRadius: theme.radius.xl,
    '& [data-row-actions]': {
      visibility: 'hidden',
    },
    '&:hover [data-row-actions], &:focus-within [data-row-actions], &:has([aria-expanded="true"]) [data-row-actions]':
      {
        visibility: 'visible',
      },
    '@media (hover: none)': {
      '& [data-row-actions]': {
        visibility: 'visible',
      },
    },
  },
  methodRow: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  },
  emptyStateContent: {
    paddingBlock: theme.spacing[9],
  },
  icon: {
    width: 'auto',
    border: 'none',
    borderRadius: theme.radius.none,
    backgroundColor: 'transparent',
  },
});
