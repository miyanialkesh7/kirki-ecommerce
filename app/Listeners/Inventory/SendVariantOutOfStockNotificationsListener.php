<?php

namespace Kirki\Ecommerce\App\Listeners\Inventory;

use Kirki\Ecommerce\App\Events\Inventory\VariantOutOfStockEvent;
use Kirki\Ecommerce\App\Jobs\SendVariantMailJob;
use Kirki\Ecommerce\App\Listeners\Concerns\ResolvesStoreAdminEmail;
use Kirki\Ecommerce\App\Mails\Admins\AdminOutOfStockMail;
use Kirki\Ecommerce\Framework\Listener;

/**
 * Listener for VariantOutOfStockEvent that queues the out-of-stock alert to the store admin.
 *
 * May run inside an order's transaction, so it only queues jobs: the queued
 * rows roll back with a failed order.
 *
 * @since 1.0.0
 */
class SendVariantOutOfStockNotificationsListener extends Listener
{
    use ResolvesStoreAdminEmail;

    /**
     * Handle the VariantOutOfStockEvent.
     *
     * @since 1.0.0
     *
     * @param VariantOutOfStockEvent $event The dispatched event.
     * @return void
     */
    public function handle(VariantOutOfStockEvent $event)
    {
        SendVariantMailJob::dispatch($event->variant, AdminOutOfStockMail::class, $this->get_admin_email());
    }
}
