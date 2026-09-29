<?php

namespace Kirki\Ecommerce\Tests\Integration;

use Kirki\Ecommerce\App\Jobs\SendVariantMailJob;
use Kirki\Ecommerce\App\Mails\Admins\AdminLowStockMail;
use Kirki\Ecommerce\App\Mails\Admins\AdminOutOfStockMail;
use Kirki\Ecommerce\App\Models\Variant;
use Kirki\Ecommerce\App\Services\InventoryService;
use Kirki\Ecommerce\App\Supports\Facades\Settings;
use Kirki\Ecommerce\Framework\Queue\QueueFake;
use Kirki\Ecommerce\Framework\Queue\QueueManager;
use Kirki\Ecommerce\Framework\Supports\Facades\Queue;
use Kirki\Ecommerce\Tests\Support\CreatesTestProducts;
use Kirki\Ecommerce\Tests\Support\RestTestCase;

use function Kirki\Ecommerce\Framework\app;

class InventoryAlertEmailsTest extends RestTestCase
{
    use CreatesTestProducts;

    /**
     * The queue fake recording dispatched jobs.
     *
     * @var QueueFake
     */
    protected $queue;

    /**
     * Variant id for the current test.
     *
     * @var int
     */
    protected $variant_id;

    /**
     * Create a product and fake the queue before each test.
     *
     * @return void
     * @since 1.0.0
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed_base_currency();

        $this->variant_id = $this->default_variant_id($this->create_product());
        $this->queue = Queue::fake();
    }

    /**
     * Drop the faked queue manager so later tests resolve a real one.
     *
     * @return void
     * @since 1.0.0
     */
    protected function tearDown(): void
    {
        static::forget_singleton(QueueManager::class);

        parent::tearDown();
    }

    /**
     * Stock dropping to the threshold alerts low stock once.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_stock_dropping_to_threshold_alerts_low_stock(): void
    {
        $this->stock(6, 5);

        $this->inventory()->reserve_stock($this->variant_id, 1);

        $this->assertSame([AdminLowStockMail::class], $this->queued_mailers());
        $this->assertNotEmpty($this->queue->pushed(SendVariantMailJob::class)[0]->email);
    }

    /**
     * Stock that keeps dropping below the threshold does not alert again.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_stock_dropping_below_threshold_does_not_alert_again(): void
    {
        $this->stock(5, 5);

        $this->inventory()->reserve_stock($this->variant_id, 2);

        $this->assertSame([], $this->queued_mailers());
    }

    /**
     * Stock running out alerts out of stock.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_stock_running_out_alerts_out_of_stock(): void
    {
        $this->stock(2, 5);

        $this->inventory()->decrement_stock($this->variant_id, 2);

        $this->assertSame([AdminOutOfStockMail::class], $this->queued_mailers());
    }

    /**
     * One reduction crossing both levels sends only the out-of-stock alert.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_crossing_both_levels_alerts_only_out_of_stock(): void
    {
        $this->stock(10, 5);

        $this->inventory()->reserve_stock($this->variant_id, 10);

        $this->assertSame([AdminOutOfStockMail::class], $this->queued_mailers());
    }

    /**
     * Restocking above the threshold and dropping again alerts again.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_restocked_variant_alerts_again(): void
    {
        $this->stock(6, 5);
        $this->inventory()->reserve_stock($this->variant_id, 1);

        $this->inventory()->increment_stock($this->variant_id, 5);
        $this->inventory()->reserve_stock($this->variant_id, 5);

        $this->assertSame([AdminLowStockMail::class, AdminLowStockMail::class], $this->queued_mailers());
    }

    /**
     * The store default threshold applies when the variant sets none.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_store_default_threshold_applies(): void
    {
        $settings = Settings::get('product');
        $settings->set(['low_stock_threshold' => 3], false);
        $this->stock(4, null);

        $this->inventory()->reserve_stock($this->variant_id, 1);

        $this->assertSame([AdminLowStockMail::class], $this->queued_mailers());
    }

    /**
     * Without a threshold, only running out alerts.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_no_threshold_means_no_low_stock_alert(): void
    {
        $this->stock(3, 0);

        $this->inventory()->reserve_stock($this->variant_id, 2);

        $this->assertSame([], $this->queued_mailers());
    }

    /**
     * A variant that does not track inventory never alerts.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_untracked_variant_does_not_alert(): void
    {
        $this->stock(2, 5, false);

        $this->inventory()->decrement_stock($this->variant_id, 2);

        $this->assertSame([], $this->queued_mailers());
    }

    /**
     * The queued alert still renders after a serialize round trip.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_queued_alert_renders_after_round_trip(): void
    {
        $this->stock(2, 5);
        $this->inventory()->reserve_stock($this->variant_id, 2);

        /** @var SendVariantMailJob $job */
        $job = unserialize(serialize($this->queue->pushed(SendVariantMailJob::class)[0]));

        $this->assertStringContainsString('Test Product', AdminOutOfStockMail::make($job->variant)->get_preview_html());
    }

    /**
     * Set the variant's stock, threshold and tracking.
     *
     * @param int      $available_quantity  Available quantity.
     * @param int|null $low_stock_threshold Variant threshold, or null for the store default.
     * @param bool     $track_inventory     Whether the variant tracks inventory.
     * @return void
     * @since 1.0.0
     */
    protected function stock(int $available_quantity, ?int $low_stock_threshold, bool $track_inventory = true): void
    {
        Variant::find($this->variant_id)->update([
            'available_quantity' => $available_quantity,
            'low_stock_threshold' => $low_stock_threshold,
            'track_inventory' => $track_inventory,
            'allow_back_order' => false,
        ]);
    }

    /**
     * Resolve the inventory service.
     *
     * @return InventoryService
     * @since 1.0.0
     */
    protected function inventory(): InventoryService
    {
        return app(InventoryService::class);
    }

    /**
     * Get the mailer classes of every queued inventory mail job, in dispatch order.
     *
     * @return string[]
     * @since 1.0.0
     */
    protected function queued_mailers(): array
    {
        return array_map(fn(SendVariantMailJob $job) => $job->mailer_class, $this->queue->pushed(SendVariantMailJob::class));
    }
}
