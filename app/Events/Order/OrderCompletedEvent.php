<?php

namespace Kirki\Ecommerce\App\Events\Order;

use Kirki\Ecommerce\App\Models\Order;
use Kirki\Ecommerce\Framework\Concerns\Dispatchable;

/**
 * Event for an order that has been completed: delivered and paid.
 *
 * Dispatched by whichever transition completes the order, marking a paid order as delivered or a delivered order as paid, so it fires once per order.
 *
 * @since 1.0.0
 */
class OrderCompletedEvent
{
    use Dispatchable;

    /** @var Order */
    public $order;

    /**
     * Create the event for a completed order.
     *
     * @since 1.0.0
     *
     * @param Order $order The completed order.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }
}
