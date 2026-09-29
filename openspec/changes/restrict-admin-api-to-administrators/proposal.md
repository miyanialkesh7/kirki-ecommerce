## Why

Every admin REST endpoint (orders, customers, settings, payment gateways, catalog) sits behind `AuthMiddleware`, which only checks that the caller is logged in. Any storefront customer who registers at checkout can therefore read every customer's personal data, refund orders, change store settings, edit payment gateway credentials, and install payment add-on code on the server. This has to be closed now, before per-resource capabilities are designed, with the simplest correct gate that already exists.

## What Changes

- **BREAKING** The admin API route group in `routes/api.php` adds the framework's existing `AdminMiddleware` (`manage_options`) after `AuthMiddleware`. Logged-out callers still get `401`; logged-in users without `manage_options` - customers, subscribers, editors - now get `403` on every admin endpoint. This matches the `manage_options` capability the admin menus already require, so anyone who can open the admin app can still use it.
- **BREAKING** `POST /orders` no longer accepts a logged-in shopper creating their own order; shoppers place orders through `POST /checkout` (which the storefront already uses exclusively).
- Customer-facing endpoints keep their current access: the cart, checkout and shop product endpoints stay public, and the `/account/*` group stays behind `AuthMiddleware` (its controllers already scope data to the logged-in customer).
- Payment webhook endpoints stay public; they are authenticated by the provider's signature (see `payment-webhook-authentication`).
- The development-only routes `/test` (admin group) and `/test-public` (public) are removed, along with `TestController`. `/test-public` exposes a database query log to anonymous visitors, and `/test` writes a store setting (`general.industry`) on every call.
- The mock `/online-payments/download/{id}` route is deliberately left public: the add-on install flow downloads from it server-to-server, which carries no login cookie. It is removed when the real cloud download URL replaces it (existing `@todo`).
- This is a stop-gap. Fine-grained per-resource capabilities (e.g. `kecom_manage_orders`, a shop manager role) are a follow-up change and out of scope here.

## Capabilities

### New Capabilities
- `admin-api-access-control`: Which REST endpoints require a store administrator, which are available to logged-in customers, and which are public; and that development/debug endpoints are not exposed.

### Modified Capabilities
<!-- None: account-self-service and payment-webhook-authentication keep their current access rules. -->

## Impact

- `routes/api.php`: admin group middleware swap; `/test` and `/test-public` routes and their now-unused imports removed.
- `app/Http/Controllers/Api/TestController.php`: deleted.
- Integration tests: order tests that place orders as a non-admin via `POST /orders` (`OrderApiTest`, `OrderActivityApiTest`) move to `POST /checkout`; new tests cover `403` for non-admins on admin endpoints.
- No frontend change: the admin SPA is only reachable by `manage_options` users (menu capability), and the storefront bundle (`resources/site/`) calls only cart, checkout, shop and `/account/*` endpoints. The unused `customerApi.updateCustomer` in `resources/site/ts/api/customer.ts` points at the admin `PUT /customers/{id}`; it is already dead code and will now also be denied - noted, not touched.
- Order `FormRequest`s that check `customer()->is_admin()` (the `administrator` role) are left as-is; they are replaced by the follow-up capabilities change.
- Third-party integrations calling admin endpoints with a non-`manage_options` account (e.g. via Application Passwords) will start receiving `403`.
