# analytics-page Specification

## Purpose

Defines the Analytics admin page: how merchants open it, the date and
comparison controls, the key metrics row, the cards, their info tooltips and
the page states. The numbers come from the analytics-metrics capability.

## Requirements

### Requirement: Analytics menu and route

The plugin SHALL add an "Analytics" submenu under the eCommerce menu, after
Orders, for users with the `manage_options` capability. It SHALL open the admin
page at `#/analytics`. The page heading SHALL read "Analytics". The page SHALL
NOT have a "View all reports" button.

#### Scenario: Open Analytics

- **WHEN** an administrator selects eCommerce → Analytics
- **THEN** the Analytics page opens with the heading "Analytics"

### Requirement: Date, comparison and currency controls

Below the heading, the page SHALL show a controls row with the date range
control and the comparison control on the left and the Customize button on the
right. The defaults SHALL be Last 30 days and Previous period. Applying a new
value in a control SHALL reload every metric and card with the new values. The
applied values SHALL be kept in the URL query, so a reload or a shared link
keeps them. The page SHALL NOT show a currency control.

#### Scenario: Change the range

- **WHEN** the merchant applies Last 7 days
- **THEN** every key metric and every card except Inventory health shows values for the last 7 days

#### Scenario: No currency control

- **WHEN** the store has orders in more than one currency
- **THEN** the page shows no currency control

#### Scenario: Reload keeps the selection

- **WHEN** the merchant applies Year to date and No comparison, and reloads the page
- **THEN** the page shows Year to date with no comparison

#### Scenario: Custom ranges in the URL

- **WHEN** the merchant applies a custom range Sep 1 – 30, 2026 and a custom comparison Aug 1 – 31, 2026, and reloads the page
- **THEN** the page shows both custom ranges

### Requirement: Date range control

The date range control SHALL be a button with a calendar icon, the preset name,
the dates of the applied range, and a chevron. It SHALL open a panel with:

- a preset list on the left: Today, Yesterday, Last 7 days, Last 30 days, Last
  90 days, Last 12 months, Month to date, Year to date, Custom;
- read-only Start and End fields that show the pending range;
- a calendar with two months;
- a footer with the number of days in the pending range and Cancel and Apply
  buttons.

A click on a preset or on calendar days SHALL change only the pending range.
Apply SHALL apply the pending range and close the panel. Cancel, Escape, or a
click outside the panel SHALL close the panel and discard the pending range.
Apply SHALL be disabled until the pending range has a start and an end. The
calendar SHALL NOT allow a day after today. The "Custom" item SHALL be active
when the pending range matches no preset, and a click on it SHALL NOT change the
pending range. When the applied range matches no preset, the trigger SHALL show
"Custom" with the dates.

#### Scenario: Apply a preset

- **WHEN** today is Oct 14, 2026, the merchant opens the date control, selects Last 7 days, and selects Apply
- **THEN** the trigger shows "Last 7 days" and "Oct 8 – 14, 2026", and every key metric and every card except Inventory health shows values for that range

#### Scenario: Cancel discards the pending range

- **WHEN** the applied range is Last 30 days, and the merchant selects Last 7 days and then Cancel
- **THEN** the panel closes and the applied range stays Last 30 days

#### Scenario: Custom days

- **WHEN** the merchant selects Sep 7 and then Sep 15 in the calendar
- **THEN** the Start field shows "Sep 7, 2026", the End field shows "Sep 15, 2026", the footer shows "9 days", and the Custom item is active

#### Scenario: Future day

- **WHEN** today is Oct 14, 2026
- **THEN** Oct 15, 2026 and later days cannot be selected

### Requirement: Comparison control

The comparison control SHALL be a button that shows "Compare:" and the dates of
the applied comparison range, or "No comparison" when comparison is off. It SHALL
open a panel with the options Previous period, Previous year, Custom, and No
comparison. Previous period and Previous year SHALL show their dates, resolved
from the applied date range, under the option name. The footer SHALL show
"Compared with" and the pending comparison range (nothing when the pending
option is No comparison), with Cancel and Apply buttons.

A click on an option SHALL change only the pending option. Apply SHALL apply it
and close the panel. Cancel, Escape, or a click outside the panel SHALL close the
panel and discard the pending option. When Custom is the pending option, the
panel SHALL show read-only Start and End fields and a calendar with two months
next to the options. The first time Custom is selected, its range SHALL start as
the previous period. Apply SHALL be disabled while the Custom range has no start
or no end. The calendar SHALL NOT allow a day after today.

#### Scenario: Apply previous period

- **WHEN** the applied range is Oct 8 – 14, 2026, and the merchant selects Previous period and Apply
- **THEN** the trigger shows "Compare: Oct 1 – 7, 2026"

#### Scenario: Option dates

- **WHEN** the applied range is Oct 8 – 14, 2026 and the merchant opens the comparison control
- **THEN** Previous period shows "Oct 1 – 7, 2026" and Previous year shows "Oct 8 – 14, 2025"

#### Scenario: Custom comparison

- **WHEN** the merchant selects Custom, selects Sep 7 and Sep 15, and selects Apply
- **THEN** the trigger shows "Compare: Sep 7 – 15, 2026" and the footer showed "Compared with Sep 7 – 15, 2026" before Apply

#### Scenario: No comparison

- **WHEN** the merchant selects No comparison and Apply
- **THEN** the trigger shows "No comparison" and every key metric change reads "No comparison"

### Requirement: Customize button

The controls row SHALL show a "Customize" button with a sliders icon on the
right side. The button SHALL be enabled and SHALL NOT do anything when selected.

#### Scenario: Select Customize

- **WHEN** the merchant selects Customize
- **THEN** nothing on the page changes

### Requirement: Analytics colors only in graphs

The analytics color tokens SHALL be used only in graphs: charts, sparklines,
bars, maps, heatmaps, gauges, and their legends. Controls, buttons, selected
items, panels, and text SHALL use the design-system color tokens. Control
triggers SHALL use the design-system white background.

#### Scenario: Selected preset

- **WHEN** a preset or comparison option is selected in a control panel
- **THEN** its highlight uses the design-system selected-item colors, not an analytics token

#### Scenario: Trigger background

- **WHEN** the controls row is shown on the grey page background
- **THEN** the date and comparison triggers have a white background

### Requirement: Key metrics row

The page SHALL show the key metrics Gross sales, Orders, Average order value and
Returning customer rate, in this order. Each key metric SHALL show its label, its
value for the range, its change against the comparison and a sparkline of the
range at the chart granularity, with the comparison series as a second line. The
change and the sparkline SHALL be on one row under the value, the change on the
left and the sparkline on the right. When there is no comparison, the change
SHALL read "No comparison". A key metric SHALL NOT be a link.

#### Scenario: Change colors

- **WHEN** Gross sales went up by 12.3%
- **THEN** the change shows "12.3%" with a trending-up icon in the success text color, with no background

#### Scenario: Decrease

- **WHEN** Orders went down by 4.0%
- **THEN** the change shows "4.0%" with a trending-down icon in the critical text color, with no background

### Requirement: Change shown as colored text

Every change against the comparison on the page (key metrics, card headlines,
Total sales breakdown rows and Sales by product rows) SHALL show as the percent
with a trending-up icon in the success text color when it went up, a
trending-down icon in the critical text color when it went down, and a flat
icon in the subdued text color when it did not change. A change SHALL NOT have a
background. Status badges, such as the stock badge, SHALL keep their background.

#### Scenario: Card headline

- **WHEN** Total sales went up by 85.4%
- **THEN** the Total sales over time headline shows "85.4%" with a trending-up icon in the success text color next to the value

#### Scenario: Breakdown row

- **WHEN** Discounts went down by 4.0%
- **THEN** the Discounts row shows "4.0%" with a trending-down icon in the critical text color, with no background

### Requirement: Cards

Below the key metrics, the page SHALL show these cards, in this order, at most
two in a row, with "full" cards taking a whole row and a card left alone in a
row filling it. On screens narrower than 720px, every card SHALL take a whole row.

| Card | Width | Shows |
|---|---|---|
| Total sales over time | full | Total sales headline and change; line chart of Total sales with the comparison series |
| Total sales breakdown | half | Rows Gross sales, Discounts (negative), Returns (negative), Net sales, Shipping charges, Taxes, Total sales, each with its change. Net and Total in bold. |
| Sales by product | half | Top 5 products by Net sales: thumbnail, name, stock left, units sold, Net sales and change |
| Sales by category | half | Top 6 categories by Net sales, as one bar each with Net sales and change |
| Average order value over time | half | AOV headline and change; line chart with no area fill, a point on each value and the comparison series |
| Orders over time | half | Orders headline and change; bar chart with a rounded comparison bar beside each current bar |
| Orders by fulfillment status | half | Share of each current fulfillment status as one 32px segmented bar and a list with count and percent; headline "N%" with "delivered · M orders" |
| New vs returning customers | half | "N customers" headline and change; stacked bars of new and returning per chart point, with no comparison mark; centered legend "New · N" and "Returning · N" |
| Sales by coupon code | half | Top 5 codes by orders using code, as one bar each with orders, "$N off" discount given and the change in orders |
| Sales by payment method | half | Top 5 methods by Total sales, with order count |
| Taxes collected by region | half | Top 5 shipping regions by Total tax |
| Shipping charges by method | half | Top 5 methods by Shipping charges, with order count |
| Inventory health | half | Counts of out-of-stock, low-stock and in-stock variants, the 4 lowest variants, and the note "Live, not affected by the date range" |

No card, card row, breakdown line or chart SHALL open another page.

#### Scenario: Stock badge in Sales by product

- **WHEN** a top product has tracked variants with 3 and −1 available, and its status is low stock
- **THEN** its badge reads "3 left in stock" in the warning badge style, the same as the home dashboard

#### Scenario: Growth in Sales by category

- **WHEN** the category Hoodies has Net sales 4100 and a change of 36.7%
- **THEN** its row shows one bar, the Net sales and "36.7%" in green with an up icon, and no comparison bar or comparison value

#### Scenario: Breakdown line is not a link

- **WHEN** the merchant selects the Discounts line in Total sales breakdown
- **THEN** nothing opens

#### Scenario: Narrow screen

- **WHEN** the screen is 600px wide
- **THEN** every card takes a whole row

### Requirement: Info tooltip on every metric

Every key metric and every card SHALL have an info icon right after its title.
The icon SHALL be hidden by default. It SHALL show when the pointer is over the
key metric or card, or when the key metric, the card or the icon has keyboard
focus. On devices without hover, the icon SHALL always show. The icon SHALL be
reachable with the keyboard, and its tooltip SHALL open on hover and on focus.
The icon's accessible name SHALL be the tooltip text. The tooltip SHALL tell how
the value is calculated, with this text (translatable):

| Title | Tooltip |
|---|---|
| Gross sales | Item prices × quantity before discounts, without tax or shipping, for orders paid in the range. |
| Orders | Orders created in the range, paid or not. Failed payments are left out. |
| Average order value | (Gross sales − discounts) ÷ number of orders paid in the range. Shipping and tax are left out. |
| Returning customer rate | Customers with a paid order in the range that was not their first paid order, ÷ all customers with a paid order in the range. |
| Total sales over time | Net sales + shipping + taxes, by the day each order was paid. Refunds are subtracted on the day they completed. |
| Total sales breakdown | Gross sales − discounts − returns = net sales. Net sales + shipping + taxes = total sales. Paid orders, by paid date. |
| Sales by product | Top products by net sales: item totals after discounts, without tax, for orders paid in the range. Stock is live. |
| Sales by category | Net sales of the products in each category. A product in two categories counts in both. |
| Average order value over time | (Gross sales − discounts) ÷ paid orders, for each day, week or month. |
| Orders over time | Orders created in each day, week or month, paid or not. Failed payments are left out. |
| Orders by fulfillment status | Orders created in the range, by their fulfillment status now. Failed payments are left out. |
| New vs returning customers | New: first paid order in the period. Returning: a paid order in the period that was not their first. One customer can be both. |
| Sales by coupon code | Paid orders that used each code, and the total discount the code gave. Free-shipping codes show the shipping fee removed. |
| Sales by payment method | Total sales of paid orders, by the payment method used. |
| Taxes collected by region | Product and shipping tax on paid orders, by the shipping address region. |
| Shipping charges by method | Shipping charged on paid orders after free-shipping discounts, without tax, by shipping method. |
| Inventory health | Live stock of every variant. Low stock means at or below the variant's low-stock threshold, or the store default. Not affected by the date range. |

#### Scenario: Icon is hidden until hover

- **WHEN** the pointer is not over the Orders key metric
- **THEN** its info icon is not visible

#### Scenario: Hover shows the icon and tooltip

- **WHEN** the merchant moves the pointer over the Orders key metric and then over its info icon
- **THEN** the icon shows, and the tooltip reads "Orders created in the range, paid or not. Failed payments are left out."

#### Scenario: Keyboard

- **WHEN** the merchant tabs to the info icon of Sales by category
- **THEN** the icon is visible and its tooltip opens

#### Scenario: Touch device

- **WHEN** the device has no hover
- **THEN** every info icon is visible

### Requirement: Chart tooltips

Hovering or focusing a chart point SHALL show the point's span label, its value
and, when there is a comparison, the comparison point's span label and value.

#### Scenario: Hover a day

- **WHEN** the merchant hovers the Oct 3 point of Total sales over time in a 7-day range with Previous period comparison
- **THEN** the tooltip shows "Oct 3, 2026" with its Total sales and the matching comparison day with its Total sales

#### Scenario: Hover a week

- **WHEN** the merchant hovers the last point of Total sales over time for Jul 21 to Oct 18, 2026, with weeks starting on Monday
- **THEN** the tooltip shows "Oct 12 – Oct 18, 2026" with the Total sales of that week

### Requirement: Chart axes

The over-time charts (Total sales, Average order value, Orders, and New vs
returning customers) SHALL draw at the pixel width of their card, so text keeps
its shape and dots are circles at every card width.

The y-axis SHALL show 5 values at round steps from 0, one on each grid line, in
a short form: values under 1,000 as whole numbers, and larger values with K, M or
B and at most 1 decimal, with no trailing ".0". Money values SHALL use the base
currency symbol in the same position as in the chart tooltips. Count values SHALL have no symbol.

The x-axis SHALL label every Nth point, starting with the first point, where
N = ceil(number of points / 12). The chart SHALL show all points, also the
points with no label. When the labels do not fit the card width, N SHALL become
larger until they fit. The steps between labels SHALL always be equal, so the
last point MAY have no label. Labels SHALL be horizontal and SHALL NOT overlap or
be cut.

#### Scenario: Money y-axis

- **WHEN** the highest Total sales point is 700.00 USD
- **THEN** the y-axis shows "$0", "$250", "$500", "$750" and "$1K"

#### Scenario: Large money values

- **WHEN** the highest Total sales point is 98,000.00 USD
- **THEN** the y-axis shows "$0", "$25K", "$50K", "$75K" and "$100K"

#### Scenario: Count y-axis

- **WHEN** the highest Orders point is 1,150
- **THEN** the y-axis shows "0", "500", "1K", "1.5K" and "2K"

#### Scenario: 7 daily points

- **WHEN** the range is Last 7 days on a wide card
- **THEN** the x-axis shows 7 labels, one for each day

#### Scenario: 30 daily points

- **WHEN** the range is Last 30 days on a wide card
- **THEN** the chart shows 30 points and the x-axis shows 10 labels, on the 1st, 4th, 7th and every 3rd point after that

#### Scenario: 13 weekly points

- **WHEN** the range is Last 90 days, the chart has 13 points and the card is wide
- **THEN** the x-axis shows 7 labels, on every 2nd week from the first

#### Scenario: 12 monthly points

- **WHEN** the range has 12 monthly points on a wide card
- **THEN** the x-axis shows 12 labels, one for each month

#### Scenario: 24 monthly points

- **WHEN** a custom range has 24 monthly points on a wide card
- **THEN** the chart shows 24 points and the x-axis shows 12 labels, on every 2nd month from the first

#### Scenario: Narrow card

- **WHEN** a half card has a 280px wide plot area and the chart has 30 points
- **THEN** the x-axis labels every 8th point (4 labels), none tilted, overlapping or cut

#### Scenario: Round dot

- **WHEN** the merchant hovers a point of a line chart on a full-width card
- **THEN** the dot on the point is a circle

### Requirement: Line chart area and last point

A line chart SHALL fill the area between the current-period line and the zero
line with a light tint of the line color, and SHALL show a dot on the last point
of the current-period line. The comparison line SHALL have no fill. The Average
order value over time chart SHALL NOT fill the area under its line, and SHALL
show a dot on each point of the current-period line.

#### Scenario: Total sales over time

- **WHEN** Total sales over time shows a range with a comparison
- **THEN** the area under the current line is filled, the dashed comparison line is not, and the last current point has a dot

#### Scenario: Average order value over time

- **WHEN** Average order value over time shows a range
- **THEN** the chart is a line chart with no area fill, and each current point has a dot

### Requirement: Orders over time bars

The Orders over time chart SHALL show, for each point, the comparison bar and
the current bar side by side, with the comparison bar on the left. The current
bar SHALL use the primary chart color and the comparison bar a faded tint of
it. Each bar SHALL have fully rounded ends. When there is no comparison, the
chart SHALL show only the current bar.

#### Scenario: Orders over time

- **WHEN** Orders over time shows a range with a comparison
- **THEN** each point has a faded comparison bar on the left and a dark current bar on the right, both with rounded ends

### Requirement: Orders by fulfillment status bar

The Orders by fulfillment status card SHALL show one bar 32px high, with one
segment for each status that has orders and a 1px gap between segments. Only
the two ends of the bar SHALL be rounded. The headline SHALL show the delivered
share in bold, followed by "delivered · M orders" in a subdued color. Each list
row SHALL show the status color, the status name, the count in bold and the
percent in a subdued color, with the count and percent aligned to the right.

#### Scenario: Orders by fulfillment status

- **WHEN** Orders by fulfillment status shows 12 orders with 6 delivered
- **THEN** the headline shows "50%" in bold and "delivered · 12 orders" beside it, above a 32px bar with rounded ends

### Requirement: New vs returning customers bars

The New vs returning customers card SHALL show one stacked bar for each chart
point, with new customers at the bottom and returning customers on top, and a
2px gap between the two segments. Only the top of the highest segment SHALL be
rounded. The chart SHALL NOT draw the comparison values, and the y-axis SHALL
scale to the current values only. The tooltip SHALL show the new and returning
values of the point and of its comparison point when the user hovers or focuses
the point. The headline SHALL show the customers count followed by "customers"
in a subdued color, and the legend SHALL be centered under the chart.

#### Scenario: New vs returning customers

- **WHEN** a chart point has 3 new and 2 returning customers, and its comparison point has 30 new and 10 returning
- **THEN** the bar shows 3 new under 2 returning with a rounded top, no comparison mark shows, and the tooltip on hover shows both points

### Requirement: Sales by coupon code bars

The Sales by coupon code card SHALL show the top 5 codes by orders, each as a
row with the code, the orders count, the discount given as "$N off" in a
subdued color, the change in orders, and a horizontal bar under the row. The
bar length SHALL be the code's orders relative to the code with the most
orders. When no comparison is selected, or the code had no orders in the
comparison period, the row SHALL show no change.

#### Scenario: Coupon code bars

- **WHEN** FREESHIP50 has 4 orders and $32.00 discount given, and 3 orders in the comparison period
- **THEN** the row shows "FREESHIP50", "4", "$32.00 off" and a 33.3% up change, with a full-length bar

### Requirement: Comparison legend

The Total sales, Average order value and Orders over-time charts SHALL show a
legend under the chart with the current range span and, when there is a
comparison, the comparison range span, each with a sample of its line or bar
style. When there is no comparison, the legend SHALL show only the current
range.

#### Scenario: With comparison

- **WHEN** the range is Oct 8 to Oct 14, 2026 and the comparison is Previous year
- **THEN** the legend shows "Oct 8 – 14, 2026" with a solid sample and "Oct 8 – 14, 2025" with a dashed sample

#### Scenario: No comparison

- **WHEN** Compare is None
- **THEN** the legend shows only the current range

### Requirement: Page states

While the analytics response loads, the key metrics and cards SHALL show
skeletons in their final layout. When the request fails, the page SHALL show the
shared query error state with a retry action. When the store has no sales orders
and no placed orders at all, the page SHALL show the banner "Your store has no
orders yet. Analytics fills in as soon as customers start paying for orders." and
each card SHALL show an empty state instead of an empty chart. A card with no
data in the range SHALL show "No data for this date range".

#### Scenario: Empty store

- **WHEN** the store has no orders
- **THEN** the banner shows, the key metrics show 0 or an empty value, and each card except Inventory health shows its empty state

#### Scenario: Range without sales

- **WHEN** the store has orders but none in the selected range
- **THEN** the banner does not show, and the cards show "No data for this date range"

#### Scenario: Request fails

- **WHEN** the analytics request returns a server error
- **THEN** the page shows the error state with a retry action
