<?php

namespace Kirki\Ecommerce\App\Listeners\Order;

use Kirki\Ecommerce\App\Events\Order\OrderCompletedEvent;
use Kirki\Ecommerce\App\Jobs\SendOrderMailJob;
use Kirki\Ecommerce\App\Mails\Customers\CustomerOrderCompletedMail;
use Kirki\Ecommerce\Framework\Listener;

/**
 * Listener for OrderCompletedEvent that queues the order-completed email to the customer.
 *
 * May run inside the order transition's transaction, so it only queues jobs:
 * the queued rows roll back with a failed transition.
 *
 * @since 1.0.0
 */
class SendOrderCompletedNotificationsListener extends Listener
{
    /**
     * Handle the OrderCompletedEvent.
     *
     * @since 1.0.0
     *
     * @param OrderCompletedEvent $event The dispatched event.
     * @return void
     */
    public function handle(OrderCompletedEvent $event)
    {
        SendOrderMailJob::dispatch($event->order, CustomerOrderCompletedMail::class, (string) $event->order->customer_email);
    }
}
