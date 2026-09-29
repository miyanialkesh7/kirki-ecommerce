<?php

namespace Kirki\Ecommerce\App\Listeners\Order;

use Kirki\Ecommerce\App\Events\Order\OrderPlaced;
use Kirki\Ecommerce\App\Jobs\SendOrderPlacedEmail;
use Kirki\Ecommerce\App\Mails\Admins\AdminNewOrderMail;
use Kirki\Ecommerce\App\Mails\Customers\CustomerNewOrderMail;
use Kirki\Ecommerce\App\Supports\Facades\Settings;
use Kirki\Ecommerce\Framework\Listener;
use Kirki\Ecommerce\Framework\Supports\Facades\Option;

/**
 * Listener for OrderShipped that is meant to record an activity log entry, currently a no-op.
 *
 * @since 1.0.0
 */
class SendOrderPlacedNotifications extends Listener
{
    /**
     * Handle the OrderShipped event.
     *
     * @since 1.0.0
     *
     * @param OrderPlaced $event The dispatched event.
     * @return void
     */
    public function handle(OrderPlaced $event)
    {
        SendOrderPlacedEmail::dispatch($event->order, CustomerNewOrderMail::class, $event->order->customer_email);
        SendOrderPlacedEmail::dispatch($event->order, AdminNewOrderMail::class, $this->get_admin_email());
    }

    /**
     * Get the admin email address from the eCommerce settings
     * Or use the WP admin email as fallback.
     * 
     * @since 1.0.0
     * 
     * @return string
     */
    protected function get_admin_email()
    {
        return Settings::get('general.store_email', Option::get('admin_email', false));
    }
}
