# Store Onboarding

A three-step setup wizard that a merchant goes through once, right after
activating the plugin. It asks for the few things the store can't guess (name,
industry, country, currency and tax stance) and then configures the store from
those answers. Sample data is opt-in and loaded from the final screen.

Until the wizard is finished, the plugin's own admin pages lead back to it. Other
WordPress admin pages are never redirected.

- [1. Quick start](#1-quick-start)
- [2. The steps](#2-the-steps)
- [3. What "Create Store" does](#3-what-create-store-does)
- [4. Loading sample data](#4-loading-sample-data)
- [5. When the wizard is shown](#5-when-the-wizard-is-shown)
- [6. Extension points](#6-extension-points)
- [7. Resetting onboarding in development](#7-resetting-onboarding-in-development)
- [8. Requirements and limitations](#8-requirements-and-limitations)
- [9. Where this differs from WooCommerce's setup wizard](#9-where-this-differs-from-woocommerces-setup-wizard)

---

## 1. Quick start

Activate the plugin from **Plugins**. The next admin page load opens the wizard at
`admin.php?page=kirki-ecommerce#/onboarding`. Fill in the three steps and press
**Create Store**. The final screen shows what was set up and offers two ways out:

| Button | What it does |
|---|---|
| **Go to dashboard** | Opens the plugin's home route (`/`). |
| **Load sample data** | Adds demo products, then opens the home route. |

## 2. The steps

| Step | Fields | Required |
|---|---|---|
| **1. Store Basics** | Store name, industry (searchable) | Store name. Industry defaults to *Other*. |
| **2. Business Info** | Country, plus an optional address (line 1, line 2, city, postcode, state) | Country. Every address field is optional. |
| **3. Essentials** | Currency (searchable, with flags); "Collect sales tax?"; when *Yes*: pricing mode and Tax ID | Currency. |

- **Country detection.** The country is preselected from the browser's time zone,
  falling back to the region of its preferred language. No location permission is
  requested and nothing is sent off the site. When neither identifies a known
  country, the field is left empty.
- **Currency preselection.** On entering step 3 with no currency chosen, the
  selected country's currency is preselected if it is in the currency list.
  Changing the country afterwards never overwrites a currency already chosen.
- **Draft.** Entered values and the current step survive a refresh within the same
  browser tab (`sessionStorage` key `kirki-ecommerce:onboarding-draft`). The draft
  is cleared when the store is created.

## 3. What "Create Store" does

One request, `POST /wp-json/kirki/ecommerce/v1/onboarding`, runs these steps in
order:

1. **Baseline seed.** Default settings, the category tree, colour and material
   attributes, and product schema profiles. Each part is skipped when its target
   already holds data. The default payment settings add two offline payment
   methods, *Cash on Delivery* and *Direct bank transfer*. Both are **disabled**:
   the merchant enables one from the Home page's setup checklist (see
   [`docs/home.md`](home.md)).
2. **General settings.** Store name, industry and Tax ID. The store address gets
   the selected country plus any address fields entered. Tax calculation is turned
   on for *Yes* and off for *No, not yet*.
3. **Tax settings.** Prices are tax-inclusive only for *Tax included in price*.
4. **Base currency.** The selected currency is created from the bundled currency
   list if it isn't stored yet, then made the only base currency (active, exchange
   rate 1).
5. **Storefront pages.** Shop, Cart, Checkout and Account are created and published,
   or reused if already assigned in **Settings → Advanced**.
6. **Presets.** The industry and location preset step runs (currently empty; see
   section 6). Then the Home checklist records which of its tax and shipping
   steps already have data (see [`docs/home.md`](home.md#5-preconfigured-steps)),
   and `kirki_ecommerce_store_created` fires.

The completion screen shows its rows in progress for at least 5 seconds, even when
setup finishes sooner. A slower setup is followed for as long as it takes. A failure is
shown as soon as it happens.

The completion record (`kirki_ecommerce_onboarding_completed_at`, a Unix timestamp)
is written only after every step succeeds. Every step is safe to repeat, so a
failed setup can be retried from the completion screen. Once onboarding is
complete, further setup requests are rejected with `409`.

The Tax ID can be changed later under **Settings → General → Store Contact
Details**.

## 4. Loading sample data

**Load sample data** calls `POST /wp-json/kirki/ecommerce/v1/onboarding/sample-data`,
which is only available after onboarding. It currently adds the demo products
bundled with the plugin, with their images imported into the media library. It
does nothing if the store already has products.

## 5. When the wizard is shown

- **After activation.** A single, interactive activation from wp-admin redirects to
  the wizard once. Bulk activation, network-wide activation and WP-CLI activation
  don't redirect. Neither does re-activating a store that is already onboarded.
- **Before completion.** Every route of the plugin's admin app redirects to the
  wizard. There is no skip.
- **After completion.** Every wizard URL redirects to the home route. Refreshing
  the completion screen counts too, so loading sample data is a one-time choice
  made on that screen.

The gate lives in the admin app, using the `is_onboarded` flag in
`window.kirki_ecommerce`. It is a navigation guarantee, not a security boundary:
the REST API stays protected by its own capability checks.

## 6. Extension points

| Hook / class | Use it to |
|---|---|
| `kirki_ecommerce_store_created` (action) | React to a new store. Receives the submitted setup values: store name, industry, country, address, currency, tax answers and Tax ID. |
| `StoreSetupService::apply_presets($industry, $country)` | Placeholder for industry- and location-based settings and data. It currently does nothing. |
| `SampleDataImporter::import()` | Placeholder for the remote sample data import. It currently loads the bundled demo products. |

## 7. Resetting onboarding in development

Delete the completion record to see the wizard again:

```bash
wp option delete kirki_ecommerce_onboarding_completed_at
```

Then clear the browser tab's `sessionStorage` draft, or open a new tab, to start
from step one.

## 8. Requirements and limitations

- **Demo prices are not converted.** The bundled demo products carry fixed price
  figures written for US dollars. In a store with another base currency the same
  figures are shown in that currency (for example ৳25 for a hoodie).
- **The Tax ID is not printed on invoices yet.** It is stored and editable, but no
  invoice template reads it.
- **Industry has no effect yet.** It is stored as a slug in general settings for
  the future preset step.
- **Admin chrome is hidden while the wizard is open.** The wizard covers the screen
  and hides the admin bar and menu. Admin notices from other plugins reappear on
  the next page.
- **Pre-beta (alpha) installs are not migrated.** Version `1.0.0-beta.1` is treated
  as the first version.

## 9. Where this differs from WooCommerce's setup wizard

- **No skip.** WooCommerce lets you skip its setup; here the plugin's pages stay
  behind the wizard until it is finished. The rest of wp-admin is unaffected.
- **No payment, shipping or extension steps.** Those are configured in Settings
  afterwards. The setup checklist on the Home page leads the merchant to them.
- **No remote calls.** Country detection is local, and sample data comes from the
  plugin itself. Nothing is fetched from or sent to a third-party service.
- **Shorter.** Three steps, with only store name, country and currency required.
