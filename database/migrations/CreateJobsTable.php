<?php

namespace Kirki\Ecommerce\Database\Migrations;

use Kirki\Ecommerce\Framework\Contracts\Migration;
use Kirki\Ecommerce\Framework\Database\Schema\Structure;
use Kirki\Ecommerce\Framework\Supports\Facades\Schema;

class CreateJobsTable implements Migration
{
    public function up()
    {
        Schema::create('kirki_ecommerce_jobs', function (Structure $table) {
            $table->id();
            $table->string('queue', 191)->default('default');
            $table->integer('priority')->default(0);
            $table->long_text('payload');
            $table->unsigned_tiny_integer('attempts')->default(0);
            $table->unsigned_integer('reserved_at')->nullable();
            $table->string('reserved_by', 32)->nullable();
            $table->unsigned_integer('available_at');
            $table->unsigned_integer('created_at');

            $table->index(['reserved_at', 'available_at', 'priority']);
            $table->index('reserved_by');
        });
    }

    public function down()
    {
        Schema::drop_if_exists('kirki_ecommerce_jobs');
    }
}
