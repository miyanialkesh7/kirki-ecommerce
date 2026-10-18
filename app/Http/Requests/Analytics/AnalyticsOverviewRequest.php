<?php

namespace Kirki\Ecommerce\App\Http\Requests\Analytics;

defined('ABSPATH') || exit;

use Kirki\Ecommerce\App\Services\AnalyticsRangeResolver;
use Kirki\Ecommerce\Framework\Exceptions\ValidationException;
use Kirki\Ecommerce\Framework\Http\Request;
use Kirki\Ecommerce\Framework\Sanitizer;

use function Kirki\Ecommerce\Framework\app;

/**
 * Validates and sanitizes the range and comparison of an analytics overview request.
 *
 * @since 1.0.0
 */
class AnalyticsOverviewRequest extends Request
{
    /**
     * @inheritDoc
     *
     * @since 1.0.0
     */
    public function rules()
    {
        return [
            'range' => 'nullable|string|in:' . implode(',', AnalyticsRangeResolver::PRESETS),
            'from' => 'nullable|string',
            'to' => 'nullable|string',
            'compare' => 'nullable|string|in:' . implode(',', AnalyticsRangeResolver::COMPARISONS),
            'compare_from' => 'nullable|string',
            'compare_to' => 'nullable|string',
        ];
    }

    /**
     * @inheritDoc
     *
     * @since 1.0.0
     */
    public function filters()
    {
        return [
            'range' => Sanitizer::TEXT,
            'from' => Sanitizer::TEXT,
            'to' => Sanitizer::TEXT,
            'compare' => Sanitizer::TEXT,
            'compare_from' => Sanitizer::TEXT,
            'compare_to' => Sanitizer::TEXT,
        ];
    }

    /**
     * Check the dates of a custom range and a custom comparison.
     *
     * @since 1.0.0
     *
     * @return void
     * @throws ValidationException When a date is missing, malformed, in the future or out of order.
     */
    protected function passed_validation()
    {
        $errors = [];

        if ($this->input('range') === 'custom') {
            $errors = $this->validate_custom_range($errors);
        }

        if ($this->input('compare') === 'custom') {
            $errors = $this->validate_custom_comparison($errors);
        }

        if (!empty($errors)) {
            throw ValidationException::with_errors($errors);
        }
    }

    /**
     * Check the start and end day of a custom range.
     *
     * @since 1.0.0
     *
     * @param array<string, string[]> $errors Errors found so far.
     *
     * @return array<string, string[]>
     */
    protected function validate_custom_range(array $errors)
    {
        $from = (string) $this->input('from');
        $to = (string) $this->input('to');

        if (!$this->is_date($from)) {
            $errors['from'] = [__('Enter a start date.', 'kirki-ecommerce')];
        }

        if (!$this->is_date($to)) {
            $errors['to'] = [__('Enter an end date.', 'kirki-ecommerce')];
        } elseif ($to > app()->make(AnalyticsRangeResolver::class)->today()) {
            $errors['to'] = [__('The end date cannot be after today.', 'kirki-ecommerce')];
        }

        if (!isset($errors['from']) && !isset($errors['to']) && $from > $to) {
            $errors['from'] = [__('The start date cannot be after the end date.', 'kirki-ecommerce')];
        }

        return $errors;
    }

    /**
     * Check the start and end day of a custom comparison range.
     *
     * @since 1.0.0
     *
     * @param array<string, string[]> $errors Errors found so far.
     *
     * @return array<string, string[]>
     */
    protected function validate_custom_comparison(array $errors)
    {
        $from = (string) $this->input('compare_from');
        $to = (string) $this->input('compare_to');

        if (!$this->is_date($from)) {
            $errors['compare_from'] = [__('Enter a comparison start date.', 'kirki-ecommerce')];
        }

        if (!$this->is_date($to)) {
            $errors['compare_to'] = [__('Enter a comparison end date.', 'kirki-ecommerce')];
        }

        if (!isset($errors['compare_from']) && !isset($errors['compare_to']) && $from > $to) {
            $errors['compare_from'] = [__('The comparison start date cannot be after the end date.', 'kirki-ecommerce')];
        }

        return $errors;
    }

    /**
     * Check that a value is a real calendar day in Y-m-d format.
     *
     * @since 1.0.0
     *
     * @param string $value Value to check.
     *
     * @return bool
     */
    protected function is_date(string $value)
    {
        if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $parts)) {
            return false;
        }

        return checkdate((int) $parts[2], (int) $parts[3], (int) $parts[1]);
    }
}
