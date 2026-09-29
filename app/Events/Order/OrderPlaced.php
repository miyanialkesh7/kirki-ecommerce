<?php

namespace Kirki\Ecommerce\App\Events\Order;

use Kirki\Ecommerce\App\Models\Order;
use Kirki\Ecommerce\Framework\Concerns\Dispatchable;

/**
 * Event for an order that has been shipped.
 *
 * @since 1.0.0
 */
class OrderPlaced
{
    use Dispatchable;

    /** @var Order */
    public $order;

    /**
     * Create the event for a shipped order.
     *
     * @since 1.0.0
     *
     * @param mixed $order The order that was shipped.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }
}
