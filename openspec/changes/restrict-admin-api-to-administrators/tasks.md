## 1. Gate the admin API

- [x] 1.1 In `routes/api.php`, change the admin group's `'middleware' => AuthMiddleware::class` to `'middleware' => [AuthMiddleware::class, AdminMiddleware::class]` and import `Kirki\Ecommerce\Framework\Middlewares\AdminMiddleware`. Leave the `/account` group, the public cart/checkout/shop routes, the webhook routes and the mock `/online-payments/download/{id}` route unchanged.
- [x] 1.2 Remove the `/test` route (admin group) and the `/test-public` closure route, then remove imports in `routes/api.php` that are now unused (`TestController`, `Post`, `Request`, `DB`, `response`) - grep each one first and keep it if anything else in the file still uses it.
- [x] 1.3 Delete `app/Http/Controllers/Api/TestController.php` after confirming nothing else references it (`grep -rn TestController app routes tests`).
- [x] 1.4 Verify: `npm run typecheck && npm test` (from `resources/app/`) pass, and `php -l routes/api.php` reports no syntax errors.

## 2. Move shopper order tests to the checkout endpoint

- [x] 2.1 In `tests/Integration/OrderApiTest.php`, find every test that calls `POST orders` while the current user is a non-admin (`create_shopper_user()` / `subscriber`) and switch it to `POST checkout`. Also switch any follow-up call such a test makes to an admin endpoint as that shopper (e.g. `GET orders/{id}`) to either the admin user or the matching `/account/*` endpoint, keeping the test's intent.
- [x] 2.2 Do the same in `tests/Integration/OrderActivityApiTest.php` (`test_customer_can_view_own_order_activities`, `test_customer_cannot_view_other_customers_order_activities`).
- [x] 2.3 Search the rest of `tests/Integration/` for admin-group endpoints called while logged in as a non-admin or `wp_set_current_user()` to a non-admin user; fix any found the same way. If any moved test asserts behaviour `/checkout` does not reproduce, add a "Correction during implementation" note to `design.md` instead of reintroducing a shopper path on `POST /orders`.
- [x] 2.4 Verify: `npm run typecheck && npm test` (from `resources/app/`) pass, and `composer test:integration` (or `composer test:docker:integration`) passes for `OrderApiTest`, `OrderActivityApiTest`, `CartApiTest`, `AddressApiTest` and `AddressFieldRulesApiTest`.

## 3. Cover the access rules with tests

- [x] 3.1 Add `tests/Integration/AdminApiAccessTest.php` (extending `RestTestCase`) with a data provider of representative admin endpoints - at least `GET orders`, `GET customers`, `PUT settings`, `POST orders`, `POST orders/{id}/refunds`, `POST online-payments/install`, `POST products`, `GET app-config` - asserting `403` for a logged-in `subscriber`, `403` for a logged-in `kirki_customer`, and `401` when logged out. *(Changed during implementation: `kirki_customer` is never registered as a role and plugin-created customers get `subscriber` (`CreateCustomerAction`), so the second forbidden case uses `editor` - a staff role with many capabilities but no `manage_options` - instead.)*
- [x] 3.2 In the same test, assert that an administrator gets a non-`401`/`403` response on `GET orders` and `GET customers`.
- [x] 3.3 Assert customer-facing access is unchanged: a logged-in `subscriber` gets success on `GET account/orders` and `GET account/addresses`; a logged-out visitor gets `401` on `GET account/addresses` and success on `GET cart` and `GET shop/products`.
- [x] 3.4 Assert `GET test` and `GET test-public` return `404` (no route) for both an administrator and a logged-out visitor.
- [x] 3.5 Verify: `npm run typecheck && npm test` (from `resources/app/`) pass, and the full `composer test` (Unit + Integration) passes - in particular the existing "unauthenticated request returns 401" tests still pass unchanged.
