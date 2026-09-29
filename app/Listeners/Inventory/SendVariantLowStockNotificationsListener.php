<?php

namespace Kirki\Ecommerce\App\Listeners\Inventory;

use Kirki\Ecommerce\App\Events\Inventory\VariantLowStockEvent;
use Kirki\Ecommerce\App\Jobs\SendVariantMailJob;
use Kirki\Ecommerce\App\Listeners\Concerns\ResolvesStoreAdminEmail;
use Kirki\Ecommerce\App\Mails\Admins\AdminLowStockMail;
use Kirki\Ecommerce\Framework\Listener;

/**
 * Listener for VariantLowStockEvent that queues the low-stock alert to the store admin.
 *
 * May run inside an order's transaction, so it only queues jobs: the queued
 * rows roll back with a failed order.
 *
 * @since 1.0.0
 */
class SendVariantLowStockNotificationsListener extends Listener
{
    use ResolvesStoreAdminEmail;

    /**
     * Handle the VariantLowStockEvent.
     *
     * @since 1.0.0
     *
     * @param VariantLowStockEvent $event The dispatched event.
     * @return void
     */
    public function handle(VariantLowStockEvent $event)
    {
        SendVariantMailJob::dispatch($event->variant, AdminLowStockMail::class, $this->get_admin_email());
    }
}
