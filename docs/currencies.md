# Currencies and Exchange Rates

The currencies a customer can shop in, and the rates the store uses to convert
prices into them. Every price, cart and order amount is stored in the **base
currency**; the other currencies are only display conversions computed from their
exchange rate.

This page covers what a rate means, what happens to the rates when the base
currency changes, and the limits of the stored precision.

- [1. Quick start](#1-quick-start)
- [2. What an exchange rate means](#2-what-an-exchange-rate-means)
- [3. Changing the base currency](#3-changing-the-base-currency)
- [4. The currencies API and request order](#4-the-currencies-api-and-request-order)
- [5. Precision](#5-precision)
- [6. Where this differs from WooCommerce](#6-where-this-differs-from-woocommerce)

---

## 1. Quick start

Go to the **Currency** settings page. The "Available Currencies" list shows every
stored currency, base first.

- **Add Currency** adds one or more currencies, each with a rate. On a store with no
  currencies, the first one becomes the base.
- Each non-base row has an inline rate input, an active toggle, and a three-dot menu
  with **Set as default** and **Delete**. The base row shows rate 1 and cannot be
  edited, deactivated or deleted.
- **Sync now** pulls fresh rates for all currencies from the configured exchange-rate
  provider.

## 2. What an exchange rate means

A currency's rate is **how many units of that currency equal 1 unit of the base
currency**. With USD as the base:

| Currency | Rate | Meaning |
| --- | --- | --- |
| USD (base) | 1 | 1 USD = 1 USD |
| EUR | 0.5 | 1 USD = 0.5 EUR |
| GBP | 0.25 | 1 USD = 0.25 GBP |

A display price is the base amount multiplied by the rate: a 10 USD product shows as
5 EUR. The base currency's rate is always 1. The store writes 1 for it whatever rate a
request sends.

## 3. Changing the base currency

When a currency becomes the base, all stored rates must be relative to it. The store
does this in the same database transaction as the base change:

1. Every stored rate is divided by the **previous rate of the new base**, and rounded
   to 6 decimal places.
2. The new base gets rate 1, and the old base stops being the base.

Choosing **Set as default** on EUR in the table above gives:

| Currency | Before | After | Calculation |
| --- | --- | --- | --- |
| EUR (new base) | 0.5 | 1 | 0.5 / 0.5 |
| USD (old base) | 1 | 2 | 1 / 0.5 |
| GBP | 0.25 | 0.5 | 0.25 / 0.5 |

This applies to every way the base changes:

- **Set as default** on the Currency settings page (`PUT /currencies`).
- **Creating a currency as the base** (`POST /currencies` with `is_base: true`). The
  rate sent for it is read as its rate against the current base. With no current
  base there is nothing to recalculate, and it is stored at rate 1.
- **Store setup** in onboarding (see [`docs/onboarding.md`](onboarding.md)). If the
  selected currency is already stored, its stored rate is used. If setup creates it,
  there is no previous rate, so the other rates stay unchanged; enter them again or
  run **Sync now**.

Stored product, cart and order amounts do **not** change. They are read in the new
base currency from then on.

## 4. The currencies API and request order

`PUT /currencies` takes an `items` list and applies the items **one at a time, in
request order**. If one item makes a currency the base and a later item sends a rate
for another currency, that later rate is stored as sent; the server does not know if
it was meant against the old base or the new one.

To change the base without that risk, send only the new base row, as the admin UI
does:

```json
{
  "items": [
    { "id": 2, "code": "EUR", "name": "Euro", "symbol": "€", "exchange_rate": 0.5, "is_base": true, "is_active": true }
  ]
}
```

The server demotes the old base itself. For an existing currency it divides by the
**stored** rate, not by the `exchange_rate` in the request.

## 5. Precision

Rates are stored with **6 decimal places** (`decimal(15,6)`). This is enough for most
pairs, but a change to a base with a low unit value (for example VND or IDR) gives
very small rates that lose precision:

- EUR against a VND base is approx. 0.92 / 25000 = 0.0000368, which is stored as
  0.000037, an error of approx. 0.5%.
- Each further base change rounds again, so the errors add up.
- A rate below 0.0000005 is stored as 0.

After a change to such a base, check the rates or run **Sync now** to get them from
the provider again.

## 6. Where this differs from WooCommerce

- **WooCommerce core has one store currency and no exchange rates.** Changing it under
  **WooCommerce → Settings → General** changes only the symbol and format; prices are
  not converted. Multi-currency needs an extension, and each extension has its own
  rate model.
- **Here, changing the base recalculates the stored rates** but, like WooCommerce,
  does not convert stored prices. A product priced 10 in USD reads as 10 EUR after EUR
  becomes the base.
- **Rates have a fixed precision of 6 decimal places** (see section 5). There is no
  per-currency rounding or price-charm rule (for example "round to .99").
- **No rate history.** The previous rates are not kept after a base change or a
  sync; only the current rate is stored.
