<?php

namespace Kirki\Ecommerce\App\Services;

use Kirki\Ecommerce\Database\Seeders\OnBoarding\ProductSeeder;

use function Kirki\Ecommerce\Framework\app;

defined('ABSPATH') || exit;

/**
 * Loads sample data into a newly set up store.
 *
 * The body of import() is the replacement point for the remote sample data
 * import: it currently loads the demo products bundled with the plugin.
 *
 * @since 1.0.0
 */
class SampleDataImporter
{
    /**
     * Import the sample data.
     *
     * Does nothing when the store already has products.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function import()
    {
        app()->make(ProductSeeder::class)->run();
    }
}
