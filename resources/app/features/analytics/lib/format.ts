import type { MoneyObject } from '@/schemas/shared/api';

const EMPTY_VALUE = '—';

const numberFormat = new Intl.NumberFormat('en-US');

const formatMoney = (money: MoneyObject | null | undefined) => {
  return money ? money.display : EMPTY_VALUE;
};

const formatNumber = (value: number | null | undefined) => {
  return value === null || value === undefined ? EMPTY_VALUE : numberFormat.format(value);
};

const formatPercent = (value: number | null | undefined) => {
  return value === null || value === undefined ? EMPTY_VALUE : `${value.toFixed(1)}%`;
};

export { EMPTY_VALUE, formatMoney, formatNumber, formatPercent };
