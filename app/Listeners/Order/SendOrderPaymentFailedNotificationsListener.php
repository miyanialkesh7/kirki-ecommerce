<?php

namespace Kirki\Ecommerce\App\Listeners\Order;

use Kirki\Ecommerce\App\Events\Order\OrderPaymentFailedEvent;
use Kirki\Ecommerce\App\Jobs\SendOrderMailJob;
use Kirki\Ecommerce\App\Listeners\Concerns\ResolvesStoreAdminEmail;
use Kirki\Ecommerce\App\Mails\Admins\AdminOrderFailedMail;
use Kirki\Ecommerce\App\Mails\Customers\CustomerOrderFailedMail;
use Kirki\Ecommerce\Framework\Listener;

/**
 * Listener for OrderPaymentFailedEvent that queues the order-failed emails to the customer and the store admin.
 *
 * May run inside the order transition's transaction, so it only queues jobs:
 * the queued rows roll back with a failed transition.
 *
 * @since 1.0.0
 */
class SendOrderPaymentFailedNotificationsListener extends Listener
{
    use ResolvesStoreAdminEmail;

    /**
     * Handle the OrderPaymentFailedEvent.
     *
     * @since 1.0.0
     *
     * @param OrderPaymentFailedEvent $event The dispatched event.
     * @return void
     */
    public function handle(OrderPaymentFailedEvent $event)
    {
        SendOrderMailJob::dispatch($event->order, CustomerOrderFailedMail::class, (string) $event->order->customer_email);
        SendOrderMailJob::dispatch($event->order, AdminOrderFailedMail::class, $this->get_admin_email());
    }
}
