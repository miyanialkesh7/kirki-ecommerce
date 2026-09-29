<?php

namespace Kirki\Ecommerce\App\Events\Inventory;

use Kirki\Ecommerce\App\Models\Variant;
use Kirki\Ecommerce\Framework\Concerns\Dispatchable;

/**
 * Event for a tracked variant whose available stock dropped to or below its low-stock threshold.
 *
 * Dispatched only when a stock reduction crosses that level, not on every
 * reduction below it.
 *
 * @since 1.0.0
 */
class VariantLowStockEvent
{
    use Dispatchable;

    /** @var Variant */
    public $variant;

    /**
     * Create the low-stock event for a variant.
     *
     * @since 1.0.0
     *
     * @param Variant $variant The variant whose stock crossed the level.
     */
    public function __construct(Variant $variant)
    {
        $this->variant = $variant;
    }
}
