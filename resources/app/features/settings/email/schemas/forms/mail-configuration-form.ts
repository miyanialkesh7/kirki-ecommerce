import { z } from 'zod';

import { isEmptyValue, prepareFormSchema, required, requiredWhen } from '@/libs/zod';
import { __ } from '@/wpi18n';

export const MailerOptions = ['smtp', 'php_mail'] as const;
export const EncryptionOptions = ['none', 'ssl', 'tls'] as const;

export const MailConfigurationShape = z.object({
  from_email: required(z.string().nullish(), __('Email is required', 'kirki-ecommerce')),
  from_name: required(z.string().nullish(), __('Name is required', 'kirki-ecommerce')),
  mailer: required(z.enum(MailerOptions).nullish(), __('Mailer is required', 'kirki-ecommerce')),
  host: requiredWhen(
    z.string().nullish(),
    (values) => values.mailer === 'smtp' && isEmptyValue(values.host),
    __('Host is required', 'kirki-ecommerce'),
  ),
  port: requiredWhen(
    z.number().nullish(),
    (values) => values.mailer === 'smtp' && isEmptyValue(values.port),
    __('Port is required', 'kirki-ecommerce'),
  ),
  encryption: requiredWhen(
    z.enum(EncryptionOptions).nullish(),
    (values) => values.mailer === 'smtp' && isEmptyValue(values.encryption),
    __('Encryption is required', 'kirki-ecommerce'),
  ),
  is_authentication_enabled: z.boolean().nullish(),
  username: requiredWhen(
    z.string().nullish(),
    (values) =>
      values.mailer === 'smtp' &&
      Boolean(values.is_authentication_enabled) &&
      isEmptyValue(values.username),
    __('Username is required', 'kirki-ecommerce'),
  ),
  password: requiredWhen(
    z.string().nullish(),
    (values) =>
      values.mailer === 'smtp' &&
      Boolean(values.is_authentication_enabled) &&
      isEmptyValue(values.password),
    __('Password is required', 'kirki-ecommerce'),
  ),
});

export const MailConfigurationFormSchema = prepareFormSchema(MailConfigurationShape).transform(
  (values) => {
    const isSmtp = values.mailer === 'smtp';

    return {
      from_email: values.from_email,
      from_name: values.from_name,
      mailer: values.mailer,
      host: isSmtp ? values.host : null,
      port: isSmtp ? values.port : null,
      encryption: isSmtp ? values.encryption : null,
      is_authentication_enabled: isSmtp ? values.is_authentication_enabled : null,
      username: isSmtp ? values.username : null,
      password: isSmtp ? values.password : null,
    };
  },
);

export type MailConfigurationFormInput = z.input<typeof MailConfigurationFormSchema>;

export type MailConfigurationFormPayload = z.output<typeof MailConfigurationFormSchema>;
