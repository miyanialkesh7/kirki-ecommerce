<?php

namespace Kirki\Ecommerce\Database\Migrations;

use Kirki\Ecommerce\Framework\Contracts\Migration;
use Kirki\Ecommerce\Framework\Database\Schema\Structure;
use Kirki\Ecommerce\Framework\Supports\Facades\Schema;

/**
 * Adds the customer_email column to the carts table.
 *
 * @since 1.0.0
 */
class AlterCartsAddCustomerEmailColumn implements Migration
{
    /**
     * Add the customer_email column to the carts table.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function up()
    {
        Schema::table('kirki_ecommerce_carts', function (Structure $table) {
            $table->string('customer_email', 255)->nullable()->comment('Contact email entered by the shopper, used for email-based coupon rules before an order exists')->after('user_id');
        });
    }

    /**
     * Drop the customer_email column from the carts table.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function down()
    {
        Schema::table('kirki_ecommerce_carts', function (Structure $table) {
            $table->drop_column(['customer_email']);
        });
    }
}
