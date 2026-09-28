<?php

namespace Kirki\Ecommerce\Database\Migrations;

use Kirki\Ecommerce\Framework\Contracts\Migration;
use Kirki\Ecommerce\Framework\Database\Schema\Structure;
use Kirki\Ecommerce\Framework\Supports\Facades\Schema;

class CreateFailedJobsTable implements Migration
{
    public function up()
    {
        Schema::create('kirki_ecommerce_failed_jobs', function (Structure $table) {
            $table->id();
            $table->string('uuid', 36);
            $table->string('queue', 191);
            $table->long_text('payload');
            $table->long_text('exception');
            $table->unsigned_integer('failed_at');

            $table->unique('uuid');
        });
    }

    public function down()
    {
        Schema::drop_if_exists('kirki_ecommerce_failed_jobs');
    }
}
