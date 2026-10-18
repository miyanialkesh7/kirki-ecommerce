import { act, cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Analytics from '@/features/analytics/pages/analytics';

import { buildEmptyRangeOverview, buildEmptyStoreOverview, buildOverview } from '../fixtures';
import { effectiveOpacity, renderPageAt } from '../helpers';

const { useAnalyticsOverviewQuery, useAnalyticsRegionsQuery } = vi.hoisted(() => ({
  useAnalyticsOverviewQuery: vi.fn(),
  useAnalyticsRegionsQuery: vi.fn(() => ({ isPending: true, isError: false })),
}));

vi.mock('@/features/analytics/services/analytics', () => ({
  useAnalyticsOverviewQuery,
  useAnalyticsRegionsQuery,
}));

type QueryState = {
  data?: unknown;
  isLoading?: boolean;
  isPending?: boolean;
  isError?: boolean;
  error?: unknown;
};

const refetch = vi.fn();

const mockQuery = (state: QueryState) => {
  useAnalyticsOverviewQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isPending: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch,
    ...state,
  });
};

const mockData = (data: unknown) => mockQuery({ data });

const lastParams = (): unknown => {
  const calls = useAnalyticsOverviewQuery.mock.calls as unknown[][];

  return calls[calls.length - 1]?.[0];
};

const KPI_TESTS_IDS = [
  'kpi-gross_sales',
  'kpi-orders',
  'kpi-average_order_value',
  'kpi-returning_customer_rate',
];

const CARDS = [
  ['total_sales_over_time', 'Total sales over time'],
  ['total_sales_breakdown', 'Total sales breakdown'],
  ['sales_by_product', 'Sales by product'],
  ['sales_by_category', 'Sales by category'],
  ['average_order_value_over_time', 'Average order value over time'],
  ['orders_over_time', 'Orders over time'],
  ['orders_by_fulfillment_status', 'Orders by fulfillment status'],
  ['new_vs_returning_customers', 'New vs returning customers'],
  ['sales_by_coupon_code', 'Sales by coupon code'],
  ['orders_by_time_of_day', 'Orders by time of day'],
  ['sales_by_location', 'Sales by location'],
  ['sales_by_payment_method', 'Sales by payment method'],
  ['taxes_by_region', 'Taxes collected by region'],
  ['shipping_charges_by_method', 'Shipping charges by method'],
  ['inventory_health', 'Inventory health'],
] as const;

const CARDS_WITH_DATA_STATE = CARDS.filter(([key]) => key !== 'inventory_health');

const KPI_LABELS = [
  ['gross_sales', 'Gross sales'],
  ['orders', 'Orders'],
  ['average_order_value', 'Average order value'],
  ['returning_customer_rate', 'Returning customer rate'],
] as const;

const TOOLTIPS: [string, string, string][] = [
  [
    'kpi-gross_sales',
    'Gross sales',
    'Item prices × quantity before discounts, without tax or shipping, for orders paid in the range.',
  ],
  [
    'kpi-orders',
    'Orders',
    'Orders created in the range, paid or not. Failed payments are left out.',
  ],
  [
    'kpi-average_order_value',
    'Average order value',
    '(Gross sales − discounts) ÷ number of orders paid in the range. Shipping and tax are left out.',
  ],
  [
    'kpi-returning_customer_rate',
    'Returning customer rate',
    'Customers with a paid order in the range that was not their first paid order, ÷ all customers with a paid order in the range.',
  ],
  [
    'card-total_sales_over_time',
    'Total sales over time',
    'Net sales + shipping + taxes, by the day each order was paid. Refunds are subtracted on the day they completed.',
  ],
  [
    'card-total_sales_breakdown',
    'Total sales breakdown',
    'Gross sales − discounts − returns = net sales. Net sales + shipping + taxes = total sales. Paid orders, by paid date.',
  ],
  [
    'card-sales_by_product',
    'Sales by product',
    'Top products by net sales: item totals after discounts, without tax, for orders paid in the range. Stock is live.',
  ],
  [
    'card-sales_by_category',
    'Sales by category',
    'Net sales of the products in each category. A product in two categories counts in both.',
  ],
  [
    'card-average_order_value_over_time',
    'Average order value over time',
    '(Gross sales − discounts) ÷ paid orders, for each day, week or month.',
  ],
  [
    'card-orders_over_time',
    'Orders over time',
    'Orders created in each day, week or month, paid or not. Failed payments are left out.',
  ],
  [
    'card-orders_by_fulfillment_status',
    'Orders by fulfillment status',
    'Orders created in the range, by their fulfillment status now. Failed payments are left out.',
  ],
  [
    'card-new_vs_returning_customers',
    'New vs returning customers',
    'New: first paid order in the period. Returning: a paid order in the period that was not their first. One customer can be both.',
  ],
  [
    'card-sales_by_coupon_code',
    'Sales by coupon code',
    'Paid orders that used each code, and the total discount the code gave. Free-shipping codes show the shipping fee removed.',
  ],
  [
    'card-sales_by_payment_method',
    'Sales by payment method',
    'Total sales of paid orders, by the payment method used.',
  ],
  [
    'card-taxes_by_region',
    'Taxes collected by region',
    'Product and shipping tax on paid orders, by the shipping address region.',
  ],
  [
    'card-shipping_charges_by_method',
    'Shipping charges by method',
    'Shipping charged on paid orders after free-shipping discounts, without tax, by shipping method.',
  ],
  [
    'card-inventory_health',
    'Inventory health',
    "Live stock of every variant. Low stock means at or below the variant's low-stock threshold, or the store default. Not affected by the date range.",
  ],
  [
    'card-sales_by_location',
    'Sales by location',
    'Where orders go: the shipping address, or the billing address when there is none. Sales: net sales of paid orders. Orders: orders created, paid or not. Customers: different customers with a paid order.',
  ],
];

const renderPage = (search = '') => renderPageAt(`/analytics${search}`, <Analytics />);

beforeEach(() => {
  useAnalyticsOverviewQuery.mockReset();
  refetch.mockReset();
  mockData(buildOverview());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Analytics page header', () => {
  // Scenario: Open Analytics
  it('has the heading "Analytics" and no "View all reports" button', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.queryByText(/view all reports/i)).not.toBeInTheDocument();
  });
});

describe('Analytics controls', () => {
  it('starts with Last 30 days with its dates and Previous period', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 14, 12, 0, 0));
    renderPage();

    const dateControl = screen.getByTestId('analytics-date-range');

    expect(dateControl).toHaveTextContent('Last 30 days');
    expect(dateControl).toHaveTextContent('Sep 15 – Oct 14, 2026');
    expect(screen.getByTestId('analytics-compare')).toHaveTextContent('Aug 16 – Sep 14, 2026');
    expect(lastParams()).toMatchObject({ range: 'last_30', compare: 'previous_period' });
  });

  // Scenario: No currency control
  it('shows no currency control', () => {
    renderPage();

    expect(screen.queryByTestId('analytics-currency')).not.toBeInTheDocument();
  });

  it('shows the Customize button', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'Customize' })).toBeInTheDocument();
  });

  // Scenario: Change the range
  it('reloads every metric for Last 7 days when the merchant applies it', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('analytics-date-range'));
    fireEvent.click(screen.getByRole('button', { name: 'Last 7 days' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(lastParams()).toMatchObject({ range: 'last_7' });
    expect(screen.getByTestId('location')).toHaveTextContent('range=last_7');
  });

  it('reloads with no comparison when the merchant applies it', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('analytics-compare'));
    fireEvent.click(screen.getByRole('button', { name: 'No comparison' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(lastParams()).toMatchObject({ compare: 'none' });
    expect(screen.getByTestId('location')).toHaveTextContent('compare=none');
  });

  // Scenario: Reload keeps the selection
  it('shows the selection kept in the URL: Year to date and No comparison', () => {
    mockData(buildOverview({ top: { compare: null } }));
    renderPage('?range=year_to_date&compare=none');

    expect(screen.getByTestId('analytics-date-range')).toHaveTextContent('Year to date');
    expect(screen.getByTestId('analytics-compare')).toHaveTextContent('No comparison');
    expect(lastParams()).toMatchObject({ range: 'year_to_date', compare: 'none' });
  });

  it('keeps the controls on screen while the data is loading', () => {
    mockQuery({ isLoading: true, isPending: true });
    renderPage();

    expect(screen.getByTestId('analytics-date-range')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-compare')).toBeInTheDocument();
  });
});

describe('Analytics key metrics', () => {
  it('shows the four key metrics in order', () => {
    renderPage();

    const ids = screen
      .getAllByTestId(/^kpi-/)
      .map((element) => element.getAttribute('data-testid'));

    expect(ids).toEqual(KPI_TESTS_IDS);
    for (const [key, label] of KPI_LABELS) {
      expect(within(screen.getByTestId(`kpi-${key}`)).getByText(label)).toBeInTheDocument();
    }
  });

  it('shows the value of each key metric', () => {
    renderPage();

    expect(screen.getByTestId('kpi-gross_sales')).toHaveTextContent('$62.00');
    expect(screen.getByTestId('kpi-orders')).toHaveTextContent('12');
    expect(screen.getByTestId('kpi-average_order_value')).toHaveTextContent('$52.00');
    expect(screen.getByTestId('kpi-returning_customer_rate')).toHaveTextContent('33.3%');
  });

  it('draws a sparkline in every key metric', () => {
    renderPage();

    for (const id of KPI_TESTS_IDS) {
      expect(within(screen.getByTestId(id)).getByTestId('sparkline')).toBeInTheDocument();
    }
  });

  // Scenario: Change colors
  it('shows an increase as "12.3%" with a trending-up icon in the success color', () => {
    renderPage();

    const badge = within(screen.getByTestId('kpi-gross_sales')).getByTestId('change-badge');

    expect(badge).toHaveTextContent('12.3%');
    expect(badge).toHaveAttribute('data-direction', 'up');
    expect(badge).toHaveAttribute('data-tone', 'success');
    expect(badge.querySelector('.lucide-trending-up')).toBeInTheDocument();
  });

  // Scenario: Decrease
  it('shows a decrease as "4.0%" with a trending-down icon in the critical color', () => {
    renderPage();

    const badge = within(screen.getByTestId('kpi-orders')).getByTestId('change-badge');

    expect(badge).toHaveTextContent('4.0%');
    expect(badge).toHaveAttribute('data-direction', 'down');
    expect(badge).toHaveAttribute('data-tone', 'critical');
    expect(badge.querySelector('.lucide-trending-down')).toBeInTheDocument();
  });

  // Scenario: Card headline and Breakdown row
  it('shows every change on the page as text with a trending icon and no background', () => {
    renderPage();

    const badges = screen.getAllByTestId('change-badge');

    expect(badges.length).toBeGreaterThan(4);
    for (const badge of badges) {
      expect(
        badge.querySelector('.lucide-trending-up, .lucide-trending-down, .lucide-minus'),
      ).toBeInTheDocument();
      expect(getComputedStyle(badge).backgroundColor).toMatch(
        /^(rgba\(0, 0, 0, 0\)|transparent|)$/,
      );
    }
  });

  it('shows no badge when the change is empty because the comparison value is zero', () => {
    renderPage();

    expect(
      within(screen.getByTestId('kpi-returning_customer_rate')).queryByTestId('change-badge'),
    ).not.toBeInTheDocument();
  });

  it('reads "No comparison" in every key metric when there is no comparison', () => {
    mockData(buildOverview({ top: { compare: null } }));
    renderPage('?compare=none');

    for (const id of KPI_TESTS_IDS) {
      const kpi = screen.getByTestId(id);

      expect(within(kpi).getByText('No comparison')).toBeInTheDocument();
      expect(within(kpi).queryByTestId('change-badge')).not.toBeInTheDocument();
    }
  });
});

describe('Analytics cards', () => {
  it('shows the 15 cards in order with their titles', () => {
    renderPage();

    const ids = screen
      .getAllByTestId(/^card-/)
      .map((element) => element.getAttribute('data-testid'));

    expect(ids).toEqual(CARDS.map(([key]) => `card-${key}`));
    for (const [key, title] of CARDS) {
      expect(within(screen.getByTestId(`card-${key}`)).getByText(title)).toBeInTheDocument();
    }
  });

  it('shows the Total sales breakdown rows in order with Net and Total in bold', () => {
    renderPage();

    const card = screen.getByTestId('card-total_sales_breakdown');
    const labels = [
      'Gross sales',
      'Discounts',
      'Returns',
      'Net sales',
      'Shipping charges',
      'Taxes',
      'Total sales',
    ];

    for (const label of labels) {
      expect(within(card).getByText(label)).toBeInTheDocument();
    }
    expect(within(card).getByTestId('breakdown-row-net_sales')).toHaveAttribute(
      'data-emphasis',
      'bold',
    );
    expect(within(card).getByTestId('breakdown-row-total_sales')).toHaveAttribute(
      'data-emphasis',
      'bold',
    );
    expect(within(card).getByTestId('breakdown-row-gross_sales')).not.toHaveAttribute(
      'data-emphasis',
      'bold',
    );
  });

  it('shows the headline of Orders by fulfillment status', () => {
    renderPage();

    const card = within(screen.getByTestId('card-orders_by_fulfillment_status'));

    expect(card.getByRole('heading', { name: '50%' })).toBeInTheDocument();
    expect(card.getByText('delivered · 12 orders')).toBeInTheDocument();
  });

  // Scenario: New vs returning customers
  it('shows the customers headline and the totals legend of New vs returning customers', () => {
    renderPage();

    const card = within(screen.getByTestId('card-new_vs_returning_customers'));

    expect(card.getByRole('heading', { name: '9' })).toBeInTheDocument();
    expect(card.getByText(/^customers?$/)).toBeInTheDocument();
    expect(card.getByText('New · 6')).toBeInTheDocument();
    expect(card.getByText('Returning · 3')).toBeInTheDocument();
  });

  // Scenario: Stock badge in Sales by product
  it('shows "3 left in stock" in the warning badge for a low-stock top product', () => {
    renderPage();

    const badge = within(screen.getByTestId('card-sales_by_product')).getByText('3 left in stock');

    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge).toHaveAttribute('data-variant', 'warning');
  });

  // Scenario: Growth in Sales by category
  it('shows one bar and the growth rate for each category in Sales by category', () => {
    renderPage();

    const card = within(screen.getByTestId('card-sales_by_category'));

    expect(card.getByTestId('change-badge')).toHaveTextContent('36.7%');
    expect(card.getByTestId('change-badge')).toHaveAttribute('data-direction', 'up');
    expect(card.queryByText('$30.00')).not.toBeInTheDocument();
  });

  // Scenario: Coupon code bars
  it('shows one bar with orders, discount and growth rate for each code in Sales by coupon code', () => {
    renderPage();

    const card = within(screen.getByTestId('card-sales_by_coupon_code'));

    expect(card.getByText('FREESHIP50')).toBeInTheDocument();
    expect(card.getByText('4')).toBeInTheDocument();
    expect(card.getByText('$32.00 off')).toBeInTheDocument();
    expect(card.getByTestId('change-badge')).toHaveTextContent('33.3%');
    expect(card.queryByText('4 orders')).not.toBeInTheDocument();
  });

  // Scenario: Payment method bars
  it('shows one bar with total sales, orders and growth rate for each method in Sales by payment method', () => {
    renderPage();

    const card = within(screen.getByTestId('card-sales_by_payment_method'));
    const badges = card.getAllByTestId('change-badge');

    expect(card.getByText('Stripe')).toBeInTheDocument();
    expect(card.getByText('$20680.27')).toBeInTheDocument();
    expect(card.getByText('209 orders')).toBeInTheDocument();
    expect(badges[0]).toHaveTextContent('36.1%');
    expect(badges[0]).toHaveAttribute('data-direction', 'up');
    expect(card.getByText('27 orders')).toBeInTheDocument();
    expect(badges[1]).toHaveTextContent('8.8%');
    expect(badges[1]).toHaveAttribute('data-direction', 'down');
  });

  // Scenario: Tax region bars, Shipping method bars
  it('shows one bar with value, secondary data and growth rate in Taxes collected by region and Shipping charges by method', () => {
    renderPage();

    const taxes = within(screen.getByTestId('card-taxes_by_region'));
    const shipping = within(screen.getByTestId('card-shipping_charges_by_method'));

    expect(taxes.getByText('Texas, United States')).toBeInTheDocument();
    expect(taxes.getByText('$6.01')).toBeInTheDocument();
    expect(taxes.getByText('Product $5.00 · Shipping $1.01')).toBeInTheDocument();
    expect(taxes.getByTestId('change-badge')).toHaveTextContent('25.0%');
    expect(taxes.getByTestId('change-badge')).toHaveAttribute('data-direction', 'up');
    expect(shipping.getByText('Standard')).toBeInTheDocument();
    expect(shipping.getByText('$8.00')).toBeInTheDocument();
    expect(shipping.getByText('7 orders')).toBeInTheDocument();
    expect(shipping.getByTestId('change-badge')).toHaveTextContent('10.0%');
    expect(shipping.getByTestId('change-badge')).toHaveAttribute('data-direction', 'down');
  });

  // Scenario: Summary line
  it('shows the busiest hour, the busiest day and the share from the busiest hour on', () => {
    renderPage();

    const summary = within(screen.getByTestId('time-of-day-summary'));

    expect(summary.getByText('Fri 6pm–7pm')).toBeInTheDocument();
    expect(summary.getByText('Tuesday')).toBeInTheDocument();
    expect(summary.getByText('After 6pm')).toBeInTheDocument();
    expect(summary.getByText('50%')).toBeInTheDocument();
  });

  it('shows the day totals and a tooltip on each dot in Orders by time of day', () => {
    renderPage();

    const card = within(screen.getByTestId('card-orders_by_time_of_day'));

    expect(card.getByTestId('dot-grid-row-1')).toHaveTextContent(/6$/);

    fireEvent.mouseEnter(card.getByRole('button', { name: 'Fri 6pm–7pm · 5 orders' }));

    expect(card.getByRole('tooltip')).toHaveTextContent('Fri 6pm–7pm · 5 orders');
  });

  // Scenario: No comparison
  it('hides the This period and Change toggle when there is no comparison', () => {
    const overview = buildOverview({ top: { compare: null } });

    mockData({
      ...overview,
      cards: {
        ...overview.cards,
        orders_by_time_of_day: { ...overview.cards.orders_by_time_of_day, previous: null },
      },
    });
    renderPage('?compare=none');

    const card = within(screen.getByTestId('card-orders_by_time_of_day'));

    expect(card.queryByRole('tab', { name: 'Change' })).not.toBeInTheDocument();
    expect(card.getByText('Bigger, darker dot = more')).toBeInTheDocument();
  });

  // Scenario: Change colors
  it('shows more orders in purple and fewer orders in gray in the Change view', () => {
    renderPage();

    const card = within(screen.getByTestId('card-orders_by_time_of_day'));

    fireEvent.mouseDown(card.getByRole('tab', { name: 'Change' }), { button: 0 });

    const more = card.getByRole('button', { name: 'Fri 6pm–7pm · 5 orders, 2 before (+3)' });
    const fewer = card.getByRole('button', { name: 'Tue 9am–10am · 3 orders, 4 before (-1)' });
    const moreDot = more.querySelector<HTMLElement>('[data-dot]');
    const fewerDot = fewer.querySelector<HTMLElement>('[data-dot]');

    expect(moreDot).toHaveAttribute('data-direction', 'up');
    expect(fewerDot).toHaveAttribute('data-direction', 'down');
    expect(parseFloat(fewerDot?.style.width ?? '0')).toBeLessThan(
      parseFloat(moreDot?.style.width ?? '0'),
    );
    expect(card.getByText(/^More than /)).toBeInTheDocument();

    fireEvent.focus(more);

    expect(card.getByRole('tooltip')).toHaveTextContent('Fri 6pm–7pm · 5 orders, 2 before (+3)');
  });

  it('shows the live note in Inventory health', () => {
    renderPage();

    expect(
      within(screen.getByTestId('card-inventory_health')).getByText(
        'Live, not affected by the date range',
      ),
    ).toBeInTheDocument();
  });

  // Scenario: Count tiles
  it('shows the stock counts as tiles in Inventory health', () => {
    renderPage();
    const card = within(screen.getByTestId('card-inventory_health'));

    expect(card.getByText('1').nextSibling).toHaveTextContent('Out of stock');
    expect(card.getByText('2').nextSibling).toHaveTextContent('Low stock');
    expect(card.getByText('30').nextSibling).toHaveTextContent('In stock');
  });

  // Scenario: Variant row badge
  it('shows a status badge without the quantity on each Inventory health row', () => {
    renderPage();
    const card = within(screen.getByTestId('card-inventory_health'));
    const row = within(card.getByText('Hoodie').closest('li') as HTMLElement);

    expect(row.getByText('Blue / M')).toBeInTheDocument();
    expect(row.getByText('Out of stock')).toHaveAttribute('data-tone', 'critical');
    expect(row.queryByText('-2')).not.toBeInTheDocument();
  });

  // Scenario: No variant needs attention
  it('shows no list in Inventory health when no variant needs attention', () => {
    mockData(
      buildOverview({
        cards: { inventory_health: { out_of_stock: 0, low_stock: 0, in_stock: 30, lowest: [] } },
      }),
    );
    renderPage();
    const card = within(screen.getByTestId('card-inventory_health'));

    expect(card.queryByRole('list')).not.toBeInTheDocument();
    expect(card.getByTestId('live-indicator')).toHaveAttribute('aria-hidden', 'true');
  });

  // Scenario: Breakdown line is not a link
  it('opens nothing when the merchant selects the Discounts line', () => {
    renderPage();
    const before = screen.getByTestId('location').textContent;

    const card = screen.getByTestId('card-total_sales_breakdown');
    fireEvent.click(within(card).getByText('Discounts'));

    expect(screen.getByTestId('location').textContent).toBe(before);
    expect(within(card).queryAllByRole('link')).toHaveLength(0);
  });

  it('has no link in any key metric or card', () => {
    renderPage();

    for (const id of [...KPI_TESTS_IDS, ...CARDS.map(([key]) => `card-${key}`)]) {
      const element = screen.getByTestId(id);

      expect(element.querySelectorAll('a, [role="link"]')).toHaveLength(0);
    }
  });
});

describe('Analytics info tooltips', () => {
  it.each(TOOLTIPS)('%s has an info icon named by its tooltip text', (testId, title, tooltip) => {
    renderPage();

    const element = screen.getByTestId(testId);

    expect(within(element).getByText(title)).toBeInTheDocument();
    expect(within(element).getByRole('button', { name: tooltip })).toBeInTheDocument();
  });

  // Scenario: Icon is hidden until hover
  it('hides the info icon of the Orders key metric while the pointer is away', () => {
    renderPage();

    const icon = within(screen.getByTestId('kpi-orders')).getByRole('button', {
      name: TOOLTIPS[1][2],
    });

    expect(effectiveOpacity(icon)).toBe(0);
  });

  // Scenario: Hover shows the icon and tooltip
  it('shows the tooltip text of the Orders key metric when the pointer is over its icon', async () => {
    renderPage();

    const icon = within(screen.getByTestId('kpi-orders')).getByRole('button', {
      name: TOOLTIPS[1][2],
    });
    fireEvent.pointerMove(icon);

    expect((await screen.findAllByRole('tooltip'))[0]).toHaveTextContent(
      'Orders created in the range, paid or not. Failed payments are left out.',
    );
  });

  // Scenario: Keyboard
  it('shows the icon of Sales by category and opens its tooltip on keyboard focus', async () => {
    renderPage();

    const icon = within(screen.getByTestId('card-sales_by_category')).getByRole('button', {
      name: TOOLTIPS[7][2],
    });
    act(() => icon.focus());

    expect(effectiveOpacity(icon)).toBe(1);
    expect((await screen.findAllByRole('tooltip'))[0]).toHaveTextContent(TOOLTIPS[7][2]);
  });
});

describe('Analytics page states', () => {
  it('shows skeletons in the final layout while loading', () => {
    mockQuery({ isLoading: true, isPending: true });
    renderPage();

    expect(screen.getAllByTestId('kpi-skeleton')).toHaveLength(4);
    expect(screen.getAllByTestId('card-skeleton')).toHaveLength(15);
    expect(screen.queryByTestId('card-total_sales_over_time')).not.toBeInTheDocument();
  });

  // Scenario: Request fails
  it('shows the error state with a retry action when the request fails', () => {
    mockQuery({ isError: true, error: new Error('Server error') });
    renderPage();

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  // Scenario: Empty store
  it('shows the banner and an empty state in each card except Inventory health for a store with no orders', () => {
    mockData(buildEmptyStoreOverview());
    renderPage();

    expect(
      screen.getByText(
        'Your store has no orders yet. Analytics fills in as soon as customers start paying for orders.',
      ),
    ).toBeInTheDocument();
    for (const [key] of CARDS_WITH_DATA_STATE) {
      expect(
        within(screen.getByTestId(`card-${key}`)).getByTestId('card-empty'),
      ).toBeInTheDocument();
    }
    expect(
      within(screen.getByTestId('card-inventory_health')).queryByTestId('card-empty'),
    ).not.toBeInTheDocument();
  });

  it('shows 0 or an empty value in the key metrics for a store with no orders', () => {
    mockData(buildEmptyStoreOverview());
    renderPage();

    expect(screen.getByTestId('kpi-orders')).toHaveTextContent('0');
    expect(screen.getByTestId('kpi-gross_sales')).toHaveTextContent('$0.00');
    expect(screen.getByTestId('kpi-average_order_value')).toHaveTextContent('—');
  });

  // Scenario: Range without sales
  it('shows "No data for this date range" in the cards, and no banner, when the store has orders but none in the range', () => {
    mockData(buildEmptyRangeOverview());
    renderPage();

    expect(screen.queryByText(/Your store has no orders yet/)).not.toBeInTheDocument();
    for (const [key] of CARDS_WITH_DATA_STATE) {
      expect(
        within(screen.getByTestId(`card-${key}`)).getByText('No data for this date range'),
      ).toBeInTheDocument();
    }
    expect(
      within(screen.getByTestId('card-inventory_health')).queryByText(
        'No data for this date range',
      ),
    ).not.toBeInTheDocument();
  });

  it('does not show the banner when the store has orders', () => {
    renderPage();

    expect(screen.queryByText(/Your store has no orders yet/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-empty')).not.toBeInTheDocument();
  });
});
