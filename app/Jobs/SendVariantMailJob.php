<?php

namespace Kirki\Ecommerce\App\Jobs;

use Kirki\Ecommerce\App\Jobs\Concerns\SendsMail;
use Kirki\Ecommerce\App\Mails\Mailer;
use Kirki\Ecommerce\App\Models\Variant;
use Kirki\Ecommerce\Framework\Contracts\ShouldQueue;
use Kirki\Ecommerce\Framework\Queue\Concerns\Queueable;
use Kirki\Ecommerce\Framework\Queue\Concerns\SerializesModels;
use RuntimeException;

/**
 * Sends one inventory email about a variant to one recipient in the background.
 *
 * @since 1.0.0
 */
class SendVariantMailJob implements ShouldQueue
{
    use Queueable;
    use SerializesModels;
    use SendsMail;

    const QUEUE = 'emails';

    /**
     * Delete the job if the variant no longer exists.
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
     * The variant the email is about.
     *
     * @var Variant
     */
    public $variant;

    /**
     * The Mailer subclass that builds the email content.
     *
     * @var string
     */
    public $mailer_class;

    /**
     * The recipient email address.
     *
     * @var string
     */
    public $email;

    /**
     * Create a new job instance.
     *
     * The variant is stored as an identifier and re-fetched when the job runs,
     * so the email shows the stock at the time it is sent.
     *
     * @since 1.0.0
     *
     * @param Variant $variant      The variant the email is about.
     * @param string  $mailer_class The Mailer subclass that builds the email.
     * @param string  $email        The recipient email address.
     */
    public function __construct(Variant $variant, string $mailer_class, string $email)
    {
        $this->variant = $variant;
        $this->mailer_class = $mailer_class;
        $this->email = $email;

        $this->on_queue(static::QUEUE);
    }

    /**
     * Send the email unless it is disabled or has no recipient.
     *
     * @since 1.0.0
     *
     * @return void
     * @throws RuntimeException When wp_mail() fails, so the queue retries the job.
     */
    public function handle()
    {
        if (!$this->can_send($this->mailer_class, $this->email)) {
            return;
        }

        /** @var Mailer $mailer */
        $mailer = new $this->mailer_class($this->variant);

        $this->deliver($mailer, $this->email);
    }
}
