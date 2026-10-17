<?php

namespace Kirki\Ecommerce\App\Http\Controllers\Api;

defined('ABSPATH') || exit;

use Kirki\Ecommerce\App\Http\Requests\Analytics\AnalyticsOverviewRequest;
use Kirki\Ecommerce\App\Services\AnalyticsQueryService;

use function Kirki\Ecommerce\Framework\response;

/**
 * Serves the Analytics page.
 *
 * @since 1.0.0
 */
class AnalyticsController
{
    /** @var AnalyticsQueryService */
    protected $query_service;

    /**
     * Create the controller with the analytics query service.
     *
     * @since 1.0.0
     *
     * @param AnalyticsQueryService $query_service Service that answers the page.
     */
    public function __construct(AnalyticsQueryService $query_service)
    {
        $this->query_service = $query_service;
    }

    /**
     * Get the key metrics and cards.
     *
     * @since 1.0.0
     *
     * @param AnalyticsOverviewRequest $request
     * @return \Kirki\Ecommerce\Framework\Http\JsonResponse
     */
    public function overview(AnalyticsOverviewRequest $request)
    {
        return response()->json([
            'data' => $this->query_service->get_overview($request->all()),
            'message' => __('Analytics overview retrieved successfully.', 'kirki-ecommerce'),
        ]);
    }
}
