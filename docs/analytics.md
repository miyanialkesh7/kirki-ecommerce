# Analytics

A page that shows how the store performs over time. It has four key metrics
and thirteen cards. Each number has a date range, a comparison with an earlier
period, and an info icon that tells how the number is calculated. Open it with
**eCommerce → Analytics**.

The page only shows numbers. No card, key metric or breakdown line opens a
report, and there is no export.

- [1. Quick start](#1-quick-start)
- [2. The controls](#2-the-controls)
- [3. What is counted](#3-what-is-counted)
- [4. Key metrics](#4-key-metrics)
- [5. Cards](#5-cards)
- [6. Data freshness](#6-data-freshness)
- [7. Limits](#7-limits)
- [8. Where this differs from Shopify and WooCommerce](#8-where-this-differs-from-shopify-and-woocommerce)

---

## 1. Quick start

Open **eCommerce → Analytics**. The page shows the last 30 days and compares
them with the 30 days before. Hover over a key metric or a card to see its info
icon. Put the pointer on the icon, or tab to it, to read how the number is
calculated. On a touch device the icons are always visible.

Only users with the `manage_options` capability (administrators) can open the
page and its data endpoint, `GET /analytics/overview`.

---

## 2. The controls

| Control | Choices | Default |
|---|---|---|
| Date range | Today, Yesterday, Last 7 days, Last 30 days, Last 90 days, Last 12 months, Month to date, Year to date, or a custom range | Last 30 days |
| Comparison | Previous period, Previous year, a custom range, or No comparison | Previous period |

- The **date range** control shows the preset name and the dates, for example
  "Last 7 days Oct 8 – 14, 2026". It opens a panel with the presets on the
  left, read-only Start and End fields, and a calendar with two months. Select
  a preset or two days in the calendar, then select **Apply**. **Cancel**,
  Escape, or a click outside the panel keeps the current range. When the
  selected days match no preset, the **Custom** item is active. You cannot
  select a day after today.
- A range includes its first and last day. "Today" is today in the site time
  zone. A custom range cannot end after today.
- **Previous period** is the same number of days, ending the day before the
  range starts. **Previous year** is the same dates one year earlier (Feb 29
  moves to Feb 28).
- The **comparison** control shows "Compare:" and the comparison dates, or "No
  comparison". Its panel shows the dates of Previous period and Previous year
  under each option, and the footer shows the selected comparison range.
  **Custom** opens Start and End fields and a calendar with two months; it
  starts at the previous period. Select **Apply** to use the selection.
- **Customize** is on the right of the controls. It does nothing yet.
- All money is in the store's base currency. There is no currency filter.
- The selection is kept in the page address (`#/analytics?range=...`), so a
  reload or a shared link shows the same view.
- The charts group the range into points by its length:

  | Days in the range | One chart point | Example |
  |---|---|---|
  | 1 to 31 | one day | Last 30 days: 30 points |
  | 32 to 186 | one week | Last 90 days: 13 or 14 points |
  | more than 186 | one month | Last 12 months: 12 or 13 points, 2 years: 24 points |

  Weeks start on
  the day set in the WordPress *Week Starts On* setting (wp-admin **Settings →
  General**), and months on day 1. The first and last point can be partial.
  The comparison uses the same grouping, and its points are matched to the
  range points by position.
- The chart shows every point. The x-axis shows the first day of a point
  ("Oct 8", or "Oct 2026" for months) on every Nth point from the first, with
  N = points ÷ 12, rounded up: every 3rd day for 30 days, every 2nd week for
  13 or 14 weeks, every month for 12 months. On a narrow card N is larger, so
  the labels do not overlap. The steps are equal, so the last point can have
  no label. The tooltip shows the full span of the point, such as
  "Oct 12 – Oct 18, 2026" for a week or "Oct 8, 2026" for a day.
- The y-axis shows 5 round values from 0 in a short form, such as "$750",
  "$1K", "$1.5K" or "$110K". Count charts show "1.2K" with no currency.
- The Total sales, Average order value and Orders charts show a legend with
  the range and the comparison range. The Total sales line has a filled area
  and a dot on its last point. The Average order value line has no filled area
  and a dot on each point.

---

## 3. What is counted

- **Paid orders (sales orders).** An order whose payment status is paid,
  refunding or refunded. A sale is dated by the day the order was paid. If an
  order has no paid date, the day it was created is used. A cash on delivery
  order created on Oct 1 and paid on Oct 5 is a sale on Oct 5.
- **Placed orders.** Every order whose payment status is not failed. Unpaid and
  cancelled orders count. They are dated by the day they were created. A failed
  order never counts, whatever its fulfillment status.
- **Returns.** A completed refund on a paid order. It is dated by the day the
  refund last changed (its update time), in the site time zone. The sale keeps
  its original day.
  Refunds are saved only in the order currency, so the amount in the base
  currency is `refund × order base total ÷ order invoiced total`, rounded half
  up. Pending and cancelled refunds are not counted.
- **Days.** Every date is converted from UTC to the site time zone before it
  is put on a day.
- **Customers.** A customer is found by the customer on the order. If the order
  has none, by the customer whose email is the same (case does not matter). If
  there is none, by the email on the order (spaces at the ends are cut and case
  does not matter). A guest and a registered customer with the same email are
  one customer. An order with no customer and no email counts as one customer by
  itself (an order-only customer): it is always a new customer and never a
  returning one. A customer's first paid order is the paid order with the
  earliest paid time, over all time. The match is made when the page loads, so a
  guest who registers later, a merge and a deleted customer are always grouped
  correctly.
- **Other base currency.** If the store changed its base currency, orders in
  the old base currency are left out of every metric.
- **Money.** Every amount is added up in minor units (cents). A ratio, such as
  Average order value, is rounded to the nearest minor unit, half up.

---

## 4. Key metrics

Each key metric shows its value for the range, a change against the comparison
and a small chart of the range beside the change. The change is
`(current − comparison) ÷ comparison`, rounded to one decimal. When the
comparison value is 0, or there is no comparison, the page shows no
percentage. With no comparison, each key metric reads "No comparison".

Every change on the page shows as colored text with no background: green with
a trending-up icon when the value went up, red with a trending-down icon when
it went down, and grey when it did not change.

| Key metric | How it is calculated (the info icon text) |
|---|---|
| Gross sales | Item prices × quantity before discounts, without tax or shipping, for orders paid in the range. |
| Orders | Orders created in the range, paid or not. Failed payments are left out. |
| Average order value | (Gross sales − discounts) ÷ number of orders paid in the range. Shipping and tax are left out. |
| Returning customer rate | Customers with a paid order in the range that was not their first paid order, ÷ all customers with a paid order in the range. |

Details:

- **Gross sales** is the sum of the item subtotals of paid orders.
- **Discounts** is Gross sales minus the sum of (item total − item tax) of paid
  orders. A free-shipping discount is not a discount here, because the shipping
  charge is already reduced by it.
- **Average order value** is empty, not zero, when no order was paid.
- **Returning customer rate** is empty when no customer paid.

---

## 5. Cards

| Card | How it is calculated (the info icon text) | Shows |
|---|---|---|
| Total sales over time | Net sales + shipping + taxes, by the day each order was paid. Refunds are subtracted on the day they completed. | Total sales, its change, and a line chart with the comparison line |
| Total sales breakdown | Gross sales − discounts − returns = net sales. Net sales + shipping + taxes = total sales. Paid orders, by paid date. | Gross sales, Discounts, Returns, Net sales, Shipping charges, Taxes and Total sales, each with its change |
| Sales by product | Top products by net sales: item totals after discounts, without tax, for orders paid in the range. Stock is live. | The top 5 products with thumbnail, stock left, units sold, net sales and change |
| Sales by category | Net sales of the products in each category. A product in two categories counts in both. | The top 6 categories, each as one bar with net sales and change |
| Average order value over time | (Gross sales − discounts) ÷ paid orders, for each day, week or month. | Average order value, its change, and a line chart with no area fill and a dot on each point |
| Orders over time | Orders created in each day, week or month, paid or not. Failed payments are left out. | Orders, items ordered, its change, and a bar chart |
| Orders by fulfillment status | Orders created in the range, by their fulfillment status now. Failed payments are left out. | A headline such as "50% delivered · 12 orders", a bar and a list with count and percent for each status |
| New vs returning customers | New: first paid order in the period. Returning: a paid order in the period that was not their first. One customer can be both. | Customers, its change, and stacked bars of new and returning customers |
| Sales by coupon code | Paid orders that used each code, and the total discount the code gave. Free-shipping codes show the shipping fee removed. | The top 5 codes by orders, with the discount given |
| Sales by payment method | Total sales of paid orders, by the payment method used. | The top 5 methods by total sales, with the order count |
| Taxes collected by region | Product and shipping tax on paid orders, by the shipping address region. | The top 5 regions by total tax, such as "Texas, United States" |
| Shipping charges by method | Shipping charged on paid orders after free-shipping discounts, without tax, by shipping method. | The top 5 methods by shipping charges, with the order count |
| Inventory health | Live stock of every variant. Low stock means at or below the variant's low-stock threshold, or the store default. Not affected by the date range. | Counts of out-of-stock, low-stock and in-stock variants, and the 4 variants with the lowest stock |

Notes:

- **Net sales** is Gross sales − Discounts − Returns. **Total sales** is Net
  sales + Shipping charges + Taxes. When a range has no returns, Total sales is
  the sum of the order totals.
- **Shipping charges** is the order shipping total minus the tax on shipping.
- **Product net sales** does not subtract Returns. An item whose product was
  deleted is grouped by its saved name. A product in no category counts under
  "Uncategorized".
- **Taxes** are grouped by the order's shipping country and state. The name of
  the state comes from the saved state ID or name (a two-letter United States
  state code also works).
- **Payment method and shipping method names** are the current names. If the
  method no longer exists, the name saved on the newest order is used, and then
  the stored ID.
- **Fulfillment statuses** are Unfulfilled, Processing, On hold, Shipped,
  Delivered, Returned and Cancelled. A fully refunded order that came back has
  the status Returned.
- **Stock status** follows the Inventory screen. An untracked variant is in
  stock when it is set as in stock. A tracked variant is out of stock at 0 or
  less, low stock at or below its low-stock threshold (the store default when
  it has none), and in stock above that. A variant that allows backorders and
  has a negative quantity is out of stock. The stock next to a product is the
  sum of the available quantity of its tracked variants, with negative
  quantities counted as 0.
- A card with nothing to show in the range reads "No data for this date range".
  A store with no orders shows a banner, and every card except Inventory health
  shows an empty state.

---

## 6. Data freshness

Analytics has no tables of its own and no background job. Every request reads
the order, order item, coupon, tax, refund, customer, product and variant
tables as they are at that moment.

- **Every change shows on the next load.** A paid order, an edited order, a
  deleted order, a completed refund, a deleted customer or product and a guest
  who registers all show up on the next request. There is no first preparation
  and no waiting state.
- **Time zone.** Dates are put on a store day when the request runs, with the
  site time zone and the start of the week that are set at that moment. A
  change of either applies to the next request.
- **Stock is live.** Inventory health, and the stock next to a product, always
  read the variants as they are now.
- **Cost.** Each request adds up the orders of the range and of the comparison
  range. A short range reads few rows. A long range on a very large store does
  more work, mainly the items and the first paid order of each customer.

For developers, the filter `kirki_ecommerce_analytics_today` (a `Y-m-d` date
that replaces today) is used by the tests.

---

## 7. Limits

- Returns are one amount for each refund. They are not split into product,
  shipping and tax. When a refund includes shipping or tax, Net sales can be a
  little too low. Taxes and Shipping charges are not reduced by refunds.
- The return day is the day a completed refund last changed. A refund that is
  edited after it completed, and stays completed, moves to the edit day. The
  orders table has no completion date for a refund.
- Categories are read as they are now. A product that moves to another category
  moves its old sales with it.
- Stock has no history, so Inventory health shows only the present.
- The Home page shows its own Net sales, which is calculated in a different way,
  so the two pages can show different numbers (section 8).

---

## 8. Where this differs from Shopify and WooCommerce

The names are familiar, but the numbers do not match one-to-one:

- **Sales are counted by the paid date.** Shopify reports orders by the day
  they were placed. WooCommerce Analytics lets the merchant choose the date type
  (created, paid or completed), and its default is the created date. Here a
  sale is always dated by the day it was paid, with no choice, and an unpaid
  order is not a sale until it is paid. The Orders metric is the one
  that counts unpaid orders, by the day they were created.
- **Returns are not split.** Shopify and WooCommerce show refunds with more
  detail. Here a return is one amount, dated by the day the refund last changed
  (normally the day it completed), and it only reduces Net sales and Total sales.
- **Average order value ignores returns.** It is (Gross sales − discounts) ÷
  paid orders, the same as Shopify, not Net sales ÷ orders.
- **Categories are live.** Sales are grouped by the categories a product is in
  now, not at the time of sale. A category change moves the old sales.
- **No sessions and no conversion rate.** The page has no visitors, sessions,
  traffic sources or conversion rate. It only reads orders.
- **No reports and no export.** Shopify and WooCommerce link their metrics to
  detailed reports and allow CSV export. Here no number opens anything.
- **Customers are grouped by email.** A guest and a registered customer with
  the same email are one customer. A customer who has their first paid order and
  another paid order in the same period counts as both new and returning.
- **Weeks follow the site setting.** They start on the day set in WordPress,
  not always on Monday.
- **The chart grouping is fixed.** Shopify and WooCommerce let the merchant
  pick the interval (day, week, month and more). Here the interval comes from
  the range length.
- **Home dashboard Net sales is different.** The Home page calculates Net sales
  as Total − Tax − Shipping − refunds. Shipping tax is in both Tax and
  Shipping, so it is subtracted twice. This page uses the formula in section 5,
  so Home and Analytics can show different Net sales until the Home page is
  corrected.
- **Base currency only.** All amounts are in the store's base currency. There is
  no filter for the currency the customer paid in, and no view of the amounts in
  that currency.
