<?php

namespace Kirki\Ecommerce\App\Listeners\Order;

use Kirki\Ecommerce\App\Constants\Order\OrderActivityType;
use Kirki\Ecommerce\App\Events\Order\OrderPlaced;
use Kirki\Ecommerce\App\Facades\OrderActivity;
use Kirki\Ecommerce\Framework\Listener;

/**
 * Listener for OrderShipped that is meant to record an activity log entry, currently a no-op.
 *
 * @since 1.0.0
 */
class LogOrderPlacedActivity extends Listener
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
        OrderActivity::log($event->order, OrderActivityType::ORDER_PLACED);
    }
}
