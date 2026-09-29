import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import CheckboxField from '@/components/form/checkbox-field';
import CountryField from '@/components/form/country-field';
import StateField from '@/components/form/state-field';
import TextField from '@/components/form/text-field';
import Button from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import Flex from '@/components/ui/flex';
import Grid from '@/components/ui/grid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Customer } from '@/features/customers';
import { getAddressSummaryLabel } from '@/features/orders/lib/customer-address';
import type { OrderFormInput } from '@/features/orders/schemas/forms/order-form';
import { useCountriesQuery } from '@/services/country';
import { __ } from '@/wpi18n';

type AddressType = 'shipping' | 'billing';

type AddressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: AddressType;
  customer: Customer;
  onSave?: () => void;
  isSaving?: boolean;
};

const ADDRESS_TITLES: Record<AddressType, string> = {
  shipping: __('Edit shipping address', 'kirki-ecommerce'),
  billing: __('Edit billing address', 'kirki-ecommerce'),
};

const FIELD_NAMES = {
  shipping: {
    id: 'shipping_id',
    firstName: 'shipping_first_name',
    lastName: 'shipping_last_name',
    email: 'shipping_email',
    addressLine1: 'shipping_address_line1',
    addressLine2: 'shipping_address_line2',
    city: 'shipping_city',
    state: 'shipping_state',
    postalCode: 'shipping_postal_code',
    country: 'shipping_country',
    phone: 'shipping_phone',
    updateAddressBook: 'should_update_shipping_address',
  },
  billing: {
    id: 'billing_id',
    firstName: 'billing_first_name',
    lastName: 'billing_last_name',
    email: 'billing_email',
    addressLine1: 'billing_address_line1',
    addressLine2: 'billing_address_line2',
    city: 'billing_city',
    state: 'billing_state',
    postalCode: 'billing_postal_code',
    country: 'billing_country',
    phone: 'billing_phone',
    updateAddressBook: 'should_update_billing_address',
  },
} as const satisfies Record<AddressType, Record<string, keyof OrderFormInput>>;

const ADDRESS_FIELD_KEYS = [
  'shipping_id',
  'shipping_first_name',
  'shipping_last_name',
  'shipping_email',
  'shipping_phone',
  'shipping_address_line1',
  'shipping_address_line2',
  'shipping_city',
  'shipping_state',
  'shipping_postal_code',
  'shipping_country',
  'billing_id',
  'billing_first_name',
  'billing_last_name',
  'billing_email',
  'billing_phone',
  'billing_address_line1',
  'billing_address_line2',
  'billing_city',
  'billing_state',
  'billing_postal_code',
  'billing_country',
] as const satisfies readonly (keyof OrderFormInput)[];

const AddressDialog = ({
  open,
  onOpenChange,
  type,
  customer,
  onSave,
  isSaving,
}: AddressDialogProps) => {
  const form = useFormContext<OrderFormInput>();
  const snapshot = useRef(form.getValues());
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const fields = FIELD_NAMES[type];
  const country = useWatch({ control: form.control, name: fields.country });
  const { data: countries = [] } = useCountriesQuery({ limit: -1 });

  const isApplyingSelectionRef = useRef(false);
  const watchedFieldValues = useWatch({
    control: form.control,
    name: [
      fields.firstName,
      fields.lastName,
      fields.email,
      fields.addressLine1,
      fields.addressLine2,
      fields.city,
      fields.state,
      fields.postalCode,
      fields.country,
      fields.phone,
    ],
  });

  useEffect(() => {
    if (isApplyingSelectionRef.current) {
      isApplyingSelectionRef.current = false;
      return;
    }

    setSelectedAddressId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires whenever any watched address field changes, not on identity of the array itself
  }, watchedFieldValues);

  const handleSelectAddress = (value: string) => {
    isApplyingSelectionRef.current = true;
    setSelectedAddressId(value);

    const address = (customer.addresses ?? []).find((item) => String(item.id) === value);
    if (!address) {
      return;
    }

    form.setValue(fields.id, address.id ?? null, { shouldDirty: true });
    form.setValue(fields.firstName, address.first_name ?? '', { shouldDirty: true });
    form.setValue(fields.lastName, address.last_name ?? '', { shouldDirty: true });
    form.setValue(fields.addressLine1, address.address_line1 ?? '', { shouldDirty: true });
    form.setValue(fields.addressLine2, address.address_line2 ?? '', { shouldDirty: true });
    form.setValue(fields.city, address.city ?? '', { shouldDirty: true });
    form.setValue(fields.state, address.state ?? '', { shouldDirty: true });
    form.setValue(fields.postalCode, address.postal_code ?? '', { shouldDirty: true });
    form.setValue(fields.country, address.country ?? '', { shouldDirty: true });
    form.setValue(fields.phone, address.phone ?? '', { shouldDirty: true });
  };

  const handleCancel = () => {
    form.reset(snapshot.current);
    onOpenChange(false);
  };

  const handleSave = () => {
    if (type === 'billing') {
      const shippingDefault =
        (customer.addresses ?? []).find((address) => address.is_default_shipping) ?? null;
      const billingDefault =
        (customer.addresses ?? []).find((address) => address.is_default_billing) ?? null;
      const isSameDefaultAddress = Boolean(
        shippingDefault && billingDefault && shippingDefault.id === billingDefault.id,
      );

      const dirtyFields = form.formState.dirtyFields;
      const areAddressFieldsDirty = ADDRESS_FIELD_KEYS.some((key) => Boolean(dirtyFields[key]));

      form.setValue('is_billing_same_as_shipping', isSameDefaultAddress && !areAddressFieldsDirty, {
        shouldDirty: true,
      });
    }

    onSave?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent cssOverride={{ width: '560px' }}>
        <DialogHeader>
          <DialogTitle>{ADDRESS_TITLES[type]}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogBody>
          <Flex direction="column" gap={4}>
            <Field>
              <FieldLabel>{__('Address', 'kirki-ecommerce')}</FieldLabel>
              <Select value={selectedAddressId} onValueChange={handleSelectAddress}>
                <SelectTrigger>
                  <SelectValue placeholder={__('Select address', 'kirki-ecommerce')} />
                </SelectTrigger>
                <SelectContent>
                  {(customer.addresses ?? []).map((address) => (
                    <SelectItem key={address.id} value={String(address.id)}>
                      {getAddressSummaryLabel(address, countries)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <CountryField<OrderFormInput> name={fields.country} />

            <Grid>
              <TextField<OrderFormInput>
                name={fields.firstName}
                label={__('First name', 'kirki-ecommerce')}
              />
              <TextField<OrderFormInput>
                name={fields.lastName}
                label={__('Last name', 'kirki-ecommerce')}
              />
            </Grid>

            <TextField<OrderFormInput>
              name={fields.addressLine1}
              label={__('Address', 'kirki-ecommerce')}
            />
            <TextField<OrderFormInput>
              name={fields.addressLine2}
              label={__('Apartment, suite, etc. (optional)', 'kirki-ecommerce')}
            />

            <Grid columns={3}>
              <TextField<OrderFormInput> name={fields.city} label={__('City', 'kirki-ecommerce')} />
              <StateField<OrderFormInput>
                country={country}
                name={fields.state}
                label={__('State', 'kirki-ecommerce')}
              />
              <TextField<OrderFormInput>
                name={fields.postalCode}
                label={__('Zip code', 'kirki-ecommerce')}
              />
            </Grid>

            <TextField<OrderFormInput> name={fields.phone} label={__('Phone', 'kirki-ecommerce')} />

            <CheckboxField<OrderFormInput>
              name={fields.updateAddressBook}
              label={__('Update customer address book', 'kirki-ecommerce')}
            />
          </Flex>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            {__('Cancel', 'kirki-ecommerce')}
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            {__('Save', 'kirki-ecommerce')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

AddressDialog.displayName = 'AddressDialog';

export default AddressDialog;
