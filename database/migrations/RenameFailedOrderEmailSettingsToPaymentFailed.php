<?php

namespace Kirki\Ecommerce\Database\Migrations;

use Kirki\Ecommerce\Framework\Contracts\Migration;
use Kirki\Ecommerce\Framework\Supports\Facades\Option;

/**
 * Renames the saved "failed order" email settings to "payment failed".
 *
 * Saved email settings replace the bundled defaults per top-level group, so a
 * store that saved them would otherwise have no payment_failed entry at all.
 * The merchant's enabled state and edited copy are kept; a subject or heading
 * still equal to the old default gets the new default.
 *
 * @since 1.0.0
 */
class RenameFailedOrderEmailSettingsToPaymentFailed implements Migration
{
    /**
     * Option key of the email settings.
     *
     * @var string
     */
    const OPTION_KEY = 'email';

    /**
     * Default subject and heading of the old failed_order entries, keyed by recipient type.
     *
     * @var array<string, array<string, string>>
     */
    const OLD_DEFAULTS = [
        'customer_emails' => ['subject' => 'Order Failed', 'heading' => 'Sorry, your order was unsuccessful'],
        'admin_emails' => ['subject' => 'Order failed', 'heading' => 'Order failed'],
    ];

    /**
     * Default subject and heading of the new payment_failed entries, keyed by recipient type.
     *
     * @var array<string, array<string, string>>
     */
    const NEW_DEFAULTS = [
        'customer_emails' => ['subject' => 'Payment Failed', 'heading' => 'Sorry, your payment was unsuccessful'],
        'admin_emails' => ['subject' => 'Payment failed', 'heading' => 'Payment failed'],
    ];

    /**
     * Move saved failed_order settings to payment_failed.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function up()
    {
        $this->rename('failed_order', 'payment_failed', static::OLD_DEFAULTS, static::NEW_DEFAULTS);
    }

    /**
     * Move saved payment_failed settings back to failed_order.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function down()
    {
        $this->rename('payment_failed', 'failed_order', static::NEW_DEFAULTS, static::OLD_DEFAULTS);
    }

    /**
     * Rename one order notification in the saved email settings of every recipient type.
     *
     * @since 1.0.0
     *
     * @param string                               $from          Notification key to move.
     * @param string                               $to            Notification key to move it to.
     * @param array<string, array<string, string>> $from_defaults Untouched default copy of the old key, per recipient type.
     * @param array<string, array<string, string>> $to_defaults   Default copy that replaces it, per recipient type.
     * @return void
     */
    protected function rename(string $from, string $to, array $from_defaults, array $to_defaults)
    {
        $settings = Option::get(static::OPTION_KEY);

        if (!is_array($settings)) {
            return;
        }

        $is_changed = false;

        foreach ($from_defaults as $type => $defaults) {
            $notifications = $settings[$type]['order_notifications'] ?? null;

            if (!is_array($notifications) || !isset($notifications[$from]) || isset($notifications[$to])) {
                continue;
            }

            $entry = $notifications[$from];

            foreach ($defaults as $field => $default) {
                if (is_array($entry) && ($entry[$field] ?? null) === $default) {
                    $entry[$field] = $to_defaults[$type][$field];
                }
            }

            $settings[$type]['order_notifications'] = $this->replace_key($notifications, $from, $to, $entry);
            $is_changed = true;
        }

        if ($is_changed) {
            Option::set(static::OPTION_KEY, $settings);
        }
    }

    /**
     * Replace a key in an array with a new key and value, keeping its position.
     *
     * @since 1.0.0
     *
     * @param array<string, mixed> $items Array to change.
     * @param string               $from  Key to replace.
     * @param string               $to    New key.
     * @param mixed                $value New value.
     * @return array<string, mixed>
     */
    protected function replace_key(array $items, string $from, string $to, $value)
    {
        $replaced = [];

        foreach ($items as $key => $item) {
            if ($key === $from) {
                $replaced[$to] = $value;
                continue;
            }

            $replaced[$key] = $item;
        }

        return $replaced;
    }
}
