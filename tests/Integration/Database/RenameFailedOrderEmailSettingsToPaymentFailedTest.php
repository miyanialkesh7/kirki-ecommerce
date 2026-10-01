<?php

namespace Kirki\Ecommerce\Tests\Integration\Database;

use Kirki\Ecommerce\Database\Migrations\RenameFailedOrderEmailSettingsToPaymentFailed;
use Kirki\Ecommerce\Framework\Supports\Facades\Option;
use WP_UnitTestCase;

class RenameFailedOrderEmailSettingsToPaymentFailedTest extends WP_UnitTestCase
{
    /**
     * Untouched default copy is moved to payment_failed with the new subject and heading.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_untouched_defaults_get_the_new_copy(): void
    {
        Option::set('email', $this->saved_settings([
            'is_enabled' => true,
            'subject' => 'Order Failed',
            'heading' => 'Sorry, your order was unsuccessful',
            'message' => 'Customer message',
        ], [
            'is_enabled' => true,
            'subject' => 'Order failed',
            'heading' => 'Order failed',
            'message' => 'Admin message',
        ]));

        (new RenameFailedOrderEmailSettingsToPaymentFailed())->up();

        $settings = Option::get('email');
        $customer = $settings['customer_emails']['order_notifications'];
        $admin = $settings['admin_emails']['order_notifications'];

        $this->assertArrayNotHasKey('failed_order', $customer);
        $this->assertArrayNotHasKey('failed_order', $admin);
        $this->assertSame(['new_order', 'payment_failed', 'order_note'], array_keys($customer));
        $this->assertSame('Payment Failed', $customer['payment_failed']['subject']);
        $this->assertSame('Sorry, your payment was unsuccessful', $customer['payment_failed']['heading']);
        $this->assertSame('Customer message', $customer['payment_failed']['message']);
        $this->assertSame('Payment failed', $admin['payment_failed']['subject']);
        $this->assertSame('Payment failed', $admin['payment_failed']['heading']);
    }

    /**
     * A disabled entry and edited copy are carried over as they are.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_customised_entries_keep_their_state_and_copy(): void
    {
        Option::set('email', $this->saved_settings([
            'is_enabled' => false,
            'subject' => 'We could not take your payment',
            'heading' => 'Sorry, your order was unsuccessful',
            'message' => 'Edited message',
        ], [
            'is_enabled' => true,
            'subject' => 'Heads up',
            'heading' => 'Order failed',
            'message' => 'Admin message',
        ]));

        (new RenameFailedOrderEmailSettingsToPaymentFailed())->up();

        $settings = Option::get('email');
        $customer = $settings['customer_emails']['order_notifications']['payment_failed'];
        $admin = $settings['admin_emails']['order_notifications']['payment_failed'];

        $this->assertFalse($customer['is_enabled']);
        $this->assertSame('We could not take your payment', $customer['subject']);
        $this->assertSame('Sorry, your payment was unsuccessful', $customer['heading']);
        $this->assertSame('Edited message', $customer['message']);
        $this->assertSame('Heads up', $admin['subject']);
        $this->assertSame('Payment failed', $admin['heading']);
    }

    /**
     * A store that never saved its email settings is left on the defaults.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_no_saved_settings_is_a_no_op(): void
    {
        Option::delete('email');

        (new RenameFailedOrderEmailSettingsToPaymentFailed())->up();

        $this->assertNull(Option::get('email'));
    }

    /**
     * Rolling back restores the failed_order entries and their old default copy.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_down_restores_failed_order(): void
    {
        $original = $this->saved_settings([
            'is_enabled' => true,
            'subject' => 'Order Failed',
            'heading' => 'Sorry, your order was unsuccessful',
            'message' => 'Customer message',
        ], [
            'is_enabled' => false,
            'subject' => 'Order failed',
            'heading' => 'Order failed',
            'message' => 'Admin message',
        ]);
        Option::set('email', $original);
        $migration = new RenameFailedOrderEmailSettingsToPaymentFailed();

        $migration->up();
        $migration->down();

        $this->assertSame($original, Option::get('email'));
    }

    /**
     * Build saved email settings holding the given failed_order entries.
     *
     * @param array<string, mixed> $customer_entry Customer failed_order entry.
     * @param array<string, mixed> $admin_entry    Admin failed_order entry.
     * @return array<string, mixed>
     * @since 1.0.0
     */
    protected function saved_settings(array $customer_entry, array $admin_entry): array
    {
        return [
            'customer_emails' => [
                'order_notifications' => [
                    'new_order' => ['is_enabled' => true],
                    'failed_order' => $customer_entry,
                    'order_note' => ['is_enabled' => true],
                ],
            ],
            'admin_emails' => [
                'order_notifications' => [
                    'new_order' => ['is_enabled' => true],
                    'failed_order' => $admin_entry,
                ],
            ],
        ];
    }
}
