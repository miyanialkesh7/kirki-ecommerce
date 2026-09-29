<?php

namespace Kirki\Ecommerce\App\Jobs;

use Kirki\Ecommerce\App\Mails\Mailer;
use Kirki\Ecommerce\App\Models\Order;
use Kirki\Ecommerce\Framework\Contracts\ShouldQueue;
use Kirki\Ecommerce\Framework\Queue\Concerns\Queueable;
use Kirki\Ecommerce\Framework\Queue\Concerns\SerializesModels;

/**
 * Publishes a scheduled product once its scheduled_at has arrived.
 *
 * The queue cannot cancel a job, so a job left behind by a reschedule, an
 * unschedule, a trash or a delete is neutralised by re-checking the product
 * when it runs: anything no longer due is a silent no-op.
 *
 * @since 1.0.0
 */
class SendOrderPlacedEmail implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    const QUEUE = 'emails';

    /**
     * Delete the job if the model is missing
     * 
     * @var bool
     */
    protected $delete_when_missing_models = true;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    protected $tries = 3;

    /**
     * The seconds to wait before retrying a failed attempt.
     *
     * @var int
     */
    protected $backoff = 60;

    /**
     * The product ID to publish.
     *
     * @var Order
     */
    public $order;

    /**
     * The mailer class that is responsible for generating the email content
     * 
     * @var string
     */
    public $mailer_class;

    /**
     * The email address where to send the mail.
     * 
     * @var string
     */
    public $email;

    /**
     * Create a new job instance.
     *
     * Pass IDs and scalars rather than models or posts: the job is serialized
     * when it is dispatched and restored, possibly minutes later, when it runs.
     * The job always goes to the scheduled-products queue, whichever call
     * site dispatches it.
     *
     * @since 1.0.0
     *
     * @param Order $order The product ID to publish.
     */
    public function __construct(Order $order, string $mailer_class, string $email)
    {
        $this->order = $order;
        $this->mailer_class = $mailer_class;
        $this->email = $email;

        $this->on_queue(static::QUEUE);
    }

    /**
     * Publish the product if it is still scheduled and its scheduled_at has arrived.
     *
     * @since 1.0.0
     *
     * @return void
     */
    public function handle()
    {
        if (!class_exists($this->mailer_class) || !is_subclass_of($this->mailer_class, Mailer::class)) {
            return;
        }

        $mailer = new $this->mailer_class($this->order);
        $mailer->send($this->email);
    }
}
