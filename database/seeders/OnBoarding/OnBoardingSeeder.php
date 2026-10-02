<?php

namespace Kirki\Ecommerce\Database\Seeders\OnBoarding;

use Kirki\Ecommerce\Framework\Database\Seeder;

/**
 * Entry seeder that queues the baseline onboarding seeders run during store setup.
 *
 * @since 1.0.0
 */
class OnBoardingSeeder extends Seeder
{
    /**
     * Queue the seeders that give a newly set up store its baseline catalog data and settings.
     *
     * Settings come first so the merchant's onboarding answers, written after this
     * seeder drains, merge over the defaults. Each child guards its own target, so
     * this is safe to reach more than once. Demo products are not part of the
     * baseline - they are loaded on request through the sample data importer.
     *
     * This queues only - the caller invokes the seeder to drain the queue.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function run(): void
    {
        $this->call([
            SettingsSeeder::class,
            CategorySeeder::class,
            AttributeSeeder::class,
            ProductSchemaSeeder::class,
        ]);
    }
}
