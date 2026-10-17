import { act, cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import BarChart from '@/features/analytics/components/charts/bar-chart';
import DotChart from '@/features/analytics/components/charts/dot-chart';
import LineChart from '@/features/analytics/components/charts/line-chart';

import { renderInRoot } from '../helpers';

const points = [
  { date: '2026-10-02', label: 'Oct 2', value: 1500, previous_label: 'Sep 2', previous_value: 900 },
  {
    date: '2026-10-03',
    label: 'Oct 3',
    value: 3000,
    previous_label: 'Sep 3',
    previous_value: 2500,
  },
  { date: '2026-10-04', label: 'Oct 4', value: 0, previous_label: 'Sep 4', previous_value: 0 },
];

const withoutComparison = points.map(({ date, label, value }) => ({ date, label, value }));

const formatValue = (value: number) => `$${(value / 100).toFixed(2)}`;

const charts = [
  ['LineChart', LineChart],
  ['BarChart', BarChart],
  ['DotChart', DotChart],
] as const;

describe.each(charts)('%s tooltip', (_name, Chart) => {
  afterEach(cleanup);

  it('shows no tooltip until a point is hovered or focused', () => {
    renderInRoot(<Chart label="Total sales" points={points} formatValue={formatValue} />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders one focusable point for every data point', () => {
    renderInRoot(<Chart label="Total sales" points={points} formatValue={formatValue} />);

    for (let index = 0; index < points.length; index += 1) {
      expect(screen.getByTestId(`chart-point-${index}`).tabIndex).toBeGreaterThanOrEqual(0);
    }
  });

  // Scenario: Hover a day
  it('shows the day, its value and the comparison day with its value on hover', () => {
    renderInRoot(<Chart label="Total sales" points={points} formatValue={formatValue} />);

    fireEvent.pointerEnter(screen.getByTestId('chart-point-1'));
    fireEvent.mouseOver(screen.getByTestId('chart-point-1'));

    const tooltip = screen.getByRole('tooltip');

    expect(within(tooltip).getByText('Oct 3')).toBeInTheDocument();
    expect(within(tooltip).getByText('$30.00')).toBeInTheDocument();
    expect(within(tooltip).getByText('Sep 3')).toBeInTheDocument();
    expect(within(tooltip).getByText('$25.00')).toBeInTheDocument();
  });

  it('shows the same on keyboard focus', () => {
    renderInRoot(<Chart label="Total sales" points={points} formatValue={formatValue} />);

    act(() => screen.getByTestId('chart-point-0').focus());

    const tooltip = screen.getByRole('tooltip');

    expect(within(tooltip).getByText('Oct 2')).toBeInTheDocument();
    expect(within(tooltip).getByText('$15.00')).toBeInTheDocument();
    expect(within(tooltip).getByText('Sep 2')).toBeInTheDocument();
    expect(within(tooltip).getByText('$9.00')).toBeInTheDocument();
  });

  it('hides the tooltip when the point loses hover or focus', () => {
    renderInRoot(<Chart label="Total sales" points={points} formatValue={formatValue} />);
    const point = screen.getByTestId('chart-point-1');

    fireEvent.mouseOver(point);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseOut(point);
    fireEvent.pointerLeave(point);
    act(() => point.blur());

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows only the current value when there is no comparison', () => {
    renderInRoot(
      <Chart label="Total sales" points={withoutComparison} formatValue={formatValue} />,
    );

    act(() => screen.getByTestId('chart-point-1').focus());

    const tooltip = screen.getByRole('tooltip');

    expect(within(tooltip).getByText('Oct 3')).toBeInTheDocument();
    expect(within(tooltip).getByText('$30.00')).toBeInTheDocument();
    expect(within(tooltip).queryByText('Sep 3')).not.toBeInTheDocument();
  });

  it('labels the chart for assistive technology', () => {
    renderInRoot(<Chart label="Total sales" points={points} formatValue={formatValue} />);

    expect(screen.getByLabelText('Total sales')).toBeInTheDocument();
  });
});
