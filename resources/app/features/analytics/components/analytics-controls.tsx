import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, Info } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import Button from '@/components/ui/button';
import Calendar from '@/components/ui/calendar/calendar';
import Flex from '@/components/ui/flex';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Text from '@/components/ui/text';
import Tooltip from '@/components/ui/tooltip';
import {
  type CompareKey,
  formatRangeDates,
  getCompareLabel,
  getRangePresetLabel,
  RANGE_PRESETS,
  resolvePresetRange,
} from '@/features/analytics/lib/date-range';
import { getCurrencyFilterInfo } from '@/features/analytics/lib/metric-definitions';
import type { AnalyticsParams } from '@/features/analytics/lib/url-state';
import { theme } from '@/theme';
import { defineStyles, scoped, uiFocusRing } from '@/theme/mixins';
import { __ } from '@/wpi18n';

const DAY_FORMAT = 'yyyy-MM-dd';

type AnalyticsControlsProps = {
  params: AnalyticsParams;
  onChange: (params: AnalyticsParams) => void;
  currencies: string[];
  baseCurrency: string | null;
};

type OptionListProps = {
  children: ReactNode;
};

const OptionList = (props: OptionListProps) => {
  return <div css={scoped(styles.options)}>{props.children}</div>;
};

OptionList.displayName = 'OptionList';

type OptionProps = {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
};

const Option = (props: OptionProps) => {
  const { label, isSelected, onSelect } = props;

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-current={isSelected ? 'true' : undefined}
      cssOverride={{ ...styles.option, ...(isSelected ? styles.selectedOption : {}) }}
      onClick={onSelect}
    >
      {label}
    </Button>
  );
};

Option.displayName = 'Option';

type CustomRangeProps = {
  from: string | null;
  to: string | null;
  onApply: (from: string, to: string) => void;
};

const CustomRange = (props: CustomRangeProps) => {
  const { from, to, onApply } = props;
  const [isOpen, setIsOpen] = useState(false);
  const selected: DateRange | undefined = from
    ? { from: parseISO(from), to: to ? parseISO(to) : undefined }
    : undefined;

  if (!isOpen) {
    return (
      <Option label={getRangePresetLabel('custom')} isSelected={false} onSelect={() => setIsOpen(true)} />
    );
  }

  return (
    <Calendar
      mode="range"
      numberOfMonths={1}
      selected={selected}
      disabled={{ after: new Date() }}
      onSelect={(range) => {
        if (range?.from && range.to) {
          onApply(format(range.from, DAY_FORMAT), format(range.to, DAY_FORMAT));
        }
      }}
    />
  );
};

CustomRange.displayName = 'CustomRange';

type ControlTriggerProps = {
  testId: string;
  children: ReactNode;
};

const ControlTrigger = (props: ControlTriggerProps) => {
  return (
    <PopoverTrigger asChild>
      <Button variant="outline" data-testid={props.testId} cssOverride={styles.trigger}>
        {props.children}
        <ChevronDown size={14} aria-hidden="true" />
      </Button>
    </PopoverTrigger>
  );
};

ControlTrigger.displayName = 'ControlTrigger';

const DateRangeControl = (props: Pick<AnalyticsControlsProps, 'params' | 'onChange'>) => {
  const { params, onChange } = props;
  const [isOpen, setIsOpen] = useState(false);
  const range =
    params.range === 'custom' && params.from && params.to
      ? { from: params.from, to: params.to }
      : resolvePresetRange(params.range === 'custom' ? 'last_30' : params.range, new Date());

  const select = (next: Partial<AnalyticsParams>) => {
    onChange({ ...params, ...next });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <ControlTrigger testId="analytics-date-range">
        <CalendarIcon size={14} aria-hidden="true" />
        <span>{getRangePresetLabel(params.range)}</span>
        <Text variant="tiny" color="subdued">
          {formatRangeDates(range.from, range.to)}
        </Text>
      </ControlTrigger>
      <PopoverContent align="start">
        <OptionList>
          {RANGE_PRESETS.map((preset) => (
            <Option
              key={preset}
              label={getRangePresetLabel(preset)}
              isSelected={params.range === preset}
              onSelect={() => select({ range: preset, from: null, to: null })}
            />
          ))}
          <CustomRange
            from={params.from}
            to={params.to}
            onApply={(from, to) => select({ range: 'custom', from, to })}
          />
        </OptionList>
      </PopoverContent>
    </Popover>
  );
};

DateRangeControl.displayName = 'DateRangeControl';

const COMPARE_OPTIONS: CompareKey[] = ['previous_period', 'previous_year', 'none'];

const CompareControl = (props: Pick<AnalyticsControlsProps, 'params' | 'onChange'>) => {
  const { params, onChange } = props;
  const [isOpen, setIsOpen] = useState(false);

  const select = (next: Partial<AnalyticsParams>) => {
    onChange({ ...params, ...next });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <ControlTrigger testId="analytics-compare">
        <span>{getCompareLabel(params.compare)}</span>
      </ControlTrigger>
      <PopoverContent align="start">
        <OptionList>
          {COMPARE_OPTIONS.map((compare) => (
            <Option
              key={compare}
              label={getCompareLabel(compare)}
              isSelected={params.compare === compare}
              onSelect={() => select({ compare, compare_from: null, compare_to: null })}
            />
          ))}
          <CustomRange
            from={params.compare_from}
            to={params.compare_to}
            onApply={(from, to) =>
              select({ compare: 'custom', compare_from: from, compare_to: to })
            }
          />
        </OptionList>
      </PopoverContent>
    </Popover>
  );
};

CompareControl.displayName = 'CompareControl';

const CurrencyControl = (
  props: Pick<AnalyticsControlsProps, 'params' | 'onChange' | 'currencies' | 'baseCurrency'>,
) => {
  const { params, onChange, currencies, baseCurrency } = props;
  const [isOpen, setIsOpen] = useState(false);
  const info = getCurrencyFilterInfo();

  const select = (code: string) => {
    onChange({ ...params, currency: code === baseCurrency ? null : code });
    setIsOpen(false);
  };

  return (
    <Flex align="center" gap={1}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <ControlTrigger testId="analytics-currency">
          <span>{params.currency ?? baseCurrency ?? currencies[0]}</span>
        </ControlTrigger>
        <PopoverContent align="start">
          <OptionList>
            {currencies.map((code) => (
              <Option
                key={code}
                label={code}
                isSelected={(params.currency ?? baseCurrency) === code}
                onSelect={() => select(code)}
              />
            ))}
          </OptionList>
        </PopoverContent>
      </Popover>
      <Tooltip tip={info} position="top">
        <button type="button" aria-label={info} css={scoped(styles.info)}>
          <Info size={14} aria-hidden="true" />
        </button>
      </Tooltip>
    </Flex>
  );
};

CurrencyControl.displayName = 'CurrencyControl';

const AnalyticsControls = (props: AnalyticsControlsProps) => {
  const { params, onChange, currencies, baseCurrency } = props;

  return (
    <Flex align="center" gap={2} wrap="wrap">
      <DateRangeControl params={params} onChange={onChange} />
      <CompareControl params={params} onChange={onChange} />
      {currencies.length > 1 && (
        <CurrencyControl
          params={params}
          onChange={onChange}
          currencies={currencies}
          baseCurrency={baseCurrency}
        />
      )}
    </Flex>
  );
};

AnalyticsControls.displayName = 'AnalyticsControls';

export default AnalyticsControls;

const styles = defineStyles({
  trigger: {
    gap: theme.spacing[2],
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
  },
  option: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  selectedOption: {
    backgroundColor: theme.colors.analytics.status.neutralBackground,
    color: theme.colors.analytics.status.neutralText,
  },
  info: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    border: 'none',
    borderRadius: theme.radius.full,
    background: 'transparent',
    color: theme.colors.icon.secondary,
    cursor: 'help',
    '&:focus-visible': {
      ...uiFocusRing(theme),
    },
  },
});
