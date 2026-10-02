<?php

namespace Kirki\Ecommerce\Tests\Integration;

use Kirki\Ecommerce\Tests\Support\RestTestCase;

class PaymentMethodApiTest extends RestTestCase
{
    /**
     * Listing payment methods returns the registered providers with the documented fields.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_list_returns_registered_methods_with_documented_fields(): void
    {
        $response = $this->request('GET', 'payment-methods');
        $payload = $this->assert_api_success($response);

        $this->assertNotEmpty($payload['data']);

        foreach ($payload['data'] as $method) {
            foreach (['id', 'name', 'icon', 'icon_media', 'is_enabled', 'is_offline', 'description'] as $field) {
                $this->assertArrayHasKey($field, $method);
            }
        }

        $paypal = array_values(array_filter($payload['data'], fn($method) => $method['id'] === 'paypal'));
        $this->assertCount(1, $paypal);
        $this->assertFalse($paypal[0]['is_offline']);
    }

    /**
     * The combined listing is read-only.
     *
     * @return void
     * @since 1.0.0
     */
    public function test_write_verbs_are_not_routed(): void
    {
        foreach (['POST', 'PUT', 'PATCH', 'DELETE'] as $verb) {
            $response = $this->request($verb, 'payment-methods', []);
            $this->assertSame(404, $response->get_status(), $verb);
        }
    }
}
