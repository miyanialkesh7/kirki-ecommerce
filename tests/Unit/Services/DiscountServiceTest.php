<?php

namespace Kirki\Ecommerce\Tests\Unit\Services;

use Kirki\Ecommerce\App\Constants\Coupon\DiscountType;
use Kirki\Ecommerce\App\DTO\Calculation\CalculationContextDTO;
use Kirki\Ecommerce\App\Models\Coupon;
use Kirki\Ecommerce\App\Services\DiscountService;
use Kirki\Ecommerce\App\Services\OrderService;
use Kirki\Ecommerce\Framework\Exceptions\ValidationException;
use Kirki\Ecommerce\Tests\Unit\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

use function Kirki\Ecommerce\Framework\collection;

class DiscountServiceTest extends TestCase
{
    protected DiscountService $service;

    /** @var OrderService&MockObject */
    protected $order_service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->order_service = $this->createMock(OrderService::class);
        $this->service = new DiscountService($this->order_service);
    }

    public function test_calculate_applies_free_shipping_discount_when_shipping_subtotal_is_positive(): void
    {
        $context = new CalculationContextDTO();
        $context->items = [];
        $context->shipping_subtotal = 1500; // $15.00

        $coupon = new Coupon();
        $coupon->code = 'FREESHIP';
        $coupon->is_active = true;
        $coupon->discount_type = DiscountType::FREE_SHIPPING;

        $result = $this->service->calculate($context, [$coupon]);

        $this->assertEquals(1500, $result->shipping_discount);
        $this->assertCount(1, $result->coupon_results);
        $this->assertEquals(1500, $result->coupon_results[0]->shipping_discount);
        $this->assertEquals(1500, $result->coupon_results[0]->total_discount);
    }

    public function test_validate_coupon_rejects_free_shipping_when_shipping_subtotal_is_zero(): void
    {
        $context = new CalculationContextDTO();
        $context->items = [];
        $context->shipping_subtotal = 0;

        $coupon = new Coupon();
        $coupon->code = 'FREESHIP';
        $coupon->is_active = true;
        $coupon->discount_type = DiscountType::FREE_SHIPPING;

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Free shipping coupon cannot be applied when shipping cost is zero.');

        $this->service->validate_coupon($coupon, $context);
    }

    public function test_calculate_rejects_second_free_shipping_coupon(): void
    {
        $context = new CalculationContextDTO();
        $context->items = [];
        $context->shipping_subtotal = 1000;

        $coupon1 = new Coupon();
        $coupon1->code = 'SHIP1';
        $coupon1->is_active = true;
        $coupon1->discount_type = DiscountType::FREE_SHIPPING;

        $coupon2 = new Coupon();
        $coupon2->code = 'SHIP2';
        $coupon2->is_active = true;
        $coupon2->discount_type = DiscountType::FREE_SHIPPING;

        $result = $this->service->calculate($context, [$coupon1, $coupon2]);

        $this->assertCount(1, $result->coupon_results);
        $this->assertEquals('SHIP1', $result->coupon_results[0]->coupon->code);
        $this->assertCount(1, $result->invalid_coupons);
        $this->assertEquals('SHIP2', $result->invalid_coupons[0]->code);
    }

    public function test_first_time_buyer_rejects_guest_without_email(): void
    {
        $this->order_service->expects($this->never())->method('count_prior_orders');

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Please enter your email address to use this coupon.');

        $this->service->validate_coupon($this->first_time_buyer_coupon(), $this->guest_context(null));
    }

    public function test_first_time_buyer_rejects_guest_whose_email_has_prior_orders(): void
    {
        $this->order_service->method('count_prior_orders')->willReturn(1);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('This coupon is only available for first time buyers.');

        $this->service->validate_coupon($this->first_time_buyer_coupon(), $this->guest_context('guest@example.com'));
    }

    public function test_first_time_buyer_accepts_guest_with_new_email(): void
    {
        $this->order_service->expects($this->once())
            ->method('count_prior_orders')
            ->with(null, 'guest@example.com', null)
            ->willReturn(0);

        $this->service->validate_coupon($this->first_time_buyer_coupon(), $this->guest_context('guest@example.com'));
    }

    public function test_first_time_buyer_counts_by_customer_email_and_excludes_edited_order(): void
    {
        $this->order_service->expects($this->once())
            ->method('count_prior_orders')
            ->with(5, 'account@example.com', 42)
            ->willReturn(0);

        $context = $this->guest_context('account@example.com');
        $context->customer_id = 5;
        $context->order_id = 42;

        $this->service->validate_coupon($this->first_time_buyer_coupon(), $context);
    }

    public function test_customer_limit_rejects_guest_without_email(): void
    {
        $this->order_service->expects($this->never())->method('count_coupon_usages');

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Please enter your email address to use this coupon.');

        $this->service->validate_coupon($this->customer_limited_coupon(2), $this->guest_context(null));
    }

    public function test_customer_limit_accepts_guest_below_limit(): void
    {
        $this->order_service->method('count_coupon_usages')->willReturn(1);

        $this->service->validate_coupon($this->customer_limited_coupon(2), $this->guest_context('guest@example.com'));

        $this->addToAssertionCount(1);
    }

    public function test_customer_limit_rejects_guest_at_limit(): void
    {
        $this->order_service->method('count_coupon_usages')->willReturn(1);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('You have reached the usage limit for this coupon.');

        $this->service->validate_coupon($this->customer_limited_coupon(1), $this->guest_context('guest@example.com'));
    }

    public function test_customer_limit_counts_by_coupon_email_and_edited_order(): void
    {
        $this->order_service->expects($this->once())
            ->method('count_coupon_usages')
            ->with(9, null, 'guest@example.com', 42)
            ->willReturn(0);

        $context = $this->guest_context('guest@example.com');
        $context->order_id = 42;

        $this->service->validate_coupon($this->customer_limited_coupon(1), $context);
    }

    protected function guest_context(?string $email): CalculationContextDTO
    {
        $context = new CalculationContextDTO();
        $context->items = [];
        $context->customer_email = $email;

        return $context;
    }

    protected function first_time_buyer_coupon(): Coupon
    {
        $coupon = new Coupon();
        $coupon->code = 'WELCOME';
        $coupon->is_active = true;
        $coupon->first_time_buyer_only = true;

        return $coupon;
    }

    protected function customer_limited_coupon(int $limit): Coupon
    {
        $coupon = new Coupon();
        $coupon->id = 9;
        $coupon->code = 'ONCE';
        $coupon->is_active = true;
        $coupon->has_customer_limit = true;
        $coupon->customer_limit = $limit;
        $coupon->set_relation('customers', collection());

        return $coupon;
    }
}
