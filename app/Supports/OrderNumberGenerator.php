<?php

namespace Kirki\Ecommerce\App\Supports;

defined('ABSPATH') || exit;

use Kirki\Ecommerce\App\Constants\OptionKeys;
use Kirki\Ecommerce\App\Supports\Facades\Settings;
use Kirki\Ecommerce\Framework\Supports\Facades\DB;
use Kirki\Ecommerce\Framework\Wordpress\Models\Option as OptionModel;

use function Kirki\Ecommerce\Framework\with_prefix;

/**
 * Generates formatted order and invoice numbers from the general settings.
 *
 * @since 1.0.0
 */
class OrderNumberGenerator
{
    protected const ORDER_NUMBER_PADDING = 6;

    /**
     * Generate an order number from the order's own auto-increment id and
     * the general.order_number prefix/suffix settings.
     *
     * @since 1.0.0
     *
     * @param int $order_id Order ID, zero-padded to 6 digits.
     * @return string
     */
    public static function generate_order_number(int $order_id)
    {
        $settings = Settings::get('general.order_number') ?? [];

        return ($settings['prefix'] ?? '')
            . str_pad((string) $order_id, static::ORDER_NUMBER_PADDING, '0', STR_PAD_LEFT)
            . ($settings['suffix'] ?? '');
    }

    /**
     * Generate an invoice number from the general.invoice_number settings,
     * advancing the persisted running counter.
     *
     * @since 1.0.0
     *
     * @return string
     */
    public static function generate_invoice_number()
    {
        $settings = Settings::get('general.invoice_number') ?? [];
        $starting_sequence = $settings['sequence'] ?? '000001';
        $padding = $starting_sequence
            ? strlen((string) $starting_sequence)
            : static::ORDER_NUMBER_PADDING;
        $apply_year_prefix = !empty($settings['apply_year_prefix']);
        $reset_sequence_every_year = !empty($settings['reset_sequence_every_year']);

        if ($apply_year_prefix && $reset_sequence_every_year) {
            static::maybe_reset_yearly_counter((int) $starting_sequence);
        }

        $next = static::increment_last_invoice_number((int) $starting_sequence);
        $year_prefix = $apply_year_prefix ? gmdate('y') . '-' : '';

        return ($settings['prefix'] ?? '')
            . $year_prefix
            . str_pad((string) $next, $padding, '0', STR_PAD_LEFT)
            . ($settings['suffix'] ?? '');
    }

    /**
     * Reset the invoice counter to just below the configured starting
     * sequence when the calendar year has rolled over since its last use.
     *
     * Only the request that moves the stored reset year to the current year
     * resets the counter. The year is written with one upsert that locks its row
     * until the order transaction ends, so other requests wait for it and then
     * find the year already current. Every order locks the counter row anyway, so
     * taking this lock first, always in the same order, adds no extra waiting.
     *
     * @since 1.0.0
     *
     * @param int $starting_sequence Configured first invoice sequence number.
     * @return void
     */
    protected static function maybe_reset_yearly_counter(int $starting_sequence)
    {
        $current_year = (int) gmdate('Y');

        // No read comes first: a plain read in the order transaction would open a database snapshot, and a
        // write that then waits for another order's commit would fail on a snapshot-isolation server.
        // 0 rows changed means the stored year was already current; a new row or a changed year means this request owns the reset.
        $is_reset_owner = (bool) static::upsert_option(with_prefix(OptionKeys::LAST_INVOICE_NUMBER_RESET_YEAR), $current_year, '%d');

        if (!$is_reset_owner) {
            return;
        }

        OptionModel::query()
            ->where('option_name', with_prefix(OptionKeys::LAST_INVOICE_NUMBER))
            ->update(['option_value' => $starting_sequence - 1]);
    }

    /**
     * Atomically increment the persisted invoice counter and return the
     * new value.
     *
     * One upsert creates the counter with the starting sequence on the first
     * order and adds 1 on every later one. It locks the counter row until the
     * order transaction ends, so a concurrent order waits for it and the read
     * that follows is this order's own number.
     *
     * @since 1.0.0
     *
     * @param int $starting_sequence Configured first invoice sequence number.
     * @return int
     */
    protected static function increment_last_invoice_number(int $starting_sequence)
    {
        $option_name = with_prefix(OptionKeys::LAST_INVOICE_NUMBER);

        static::upsert_option($option_name, $starting_sequence, 'option_value + 1');

        $option = OptionModel::query()->where('option_name', $option_name)->first();

        return (int) ($option->option_value ?? $starting_sequence);
    }

    /**
     * Create an option row, or update it when it already exists, in one statement.
     *
     * A plain insert that hits an existing row takes a shared lock, and several
     * requests holding it then deadlock when each tries to update the row. This
     * upsert takes the exclusive lock at once, so requests queue instead.
     *
     * New rows are autoloaded, so reading them later is served from WordPress's
     * option cache and does not open a database snapshot inside the order
     * transaction, which a later write to the same row could conflict with.
     *
     * @since 1.0.0
     *
     * @param string $option_name   Prefixed option name.
     * @param int    $initial_value Value for a new row.
     * @param string $update_value  SQL expression for the value when the row exists: '%d' to write the initial value, or a column expression.
     * @return int Rows affected: 1 for a new row, 2 when an existing value changed, 0 when it was already that value.
     */
    protected static function upsert_option(string $option_name, int $initial_value, string $update_value)
    {
        $table = DB::get_table_prefix() . (new OptionModel())->get_table();
        $bindings = [$option_name, $initial_value];

        if ($update_value === '%d') {
            $bindings[] = $initial_value;
        }

        return (int) DB::update(
            "INSERT INTO {$table} (option_name, option_value, autoload) VALUES (%s, %d, 'yes') ON DUPLICATE KEY UPDATE option_value = {$update_value}",
            $bindings
        );
    }
}
