import { createContext, type ReactNode, useContext } from 'react';

import type { OrderCalculation, OrderCalculationItem } from '@/features/orders/schemas/catalog/order';
import type { OrderItem } from '@/features/orders/types';

type OrderCreateContextValue = {
  calculation: OrderCalculation | undefined;
  calculationItemById: Map<number, OrderCalculationItem>;
  rows: OrderItem[];
  isCalculating: boolean;
  rejectedCouponCodes: string[];
};

const OrderCreateContext = createContext<OrderCreateContextValue>({
  calculation: undefined,
  calculationItemById: new Map(),
  rows: [],
  isCalculating: false,
  rejectedCouponCodes: [],
});

type OrderCreateProviderProps = {
  value: OrderCreateContextValue;
  children: ReactNode;
};

const OrderCreateProvider = ({ value, children }: OrderCreateProviderProps) => {
  return <OrderCreateContext.Provider value={value}>{children}</OrderCreateContext.Provider>;
};

OrderCreateProvider.displayName = 'OrderCreateProvider';

const useOrderCreateContext = (): OrderCreateContextValue => {
  return useContext(OrderCreateContext);
};

export { OrderCreateProvider, useOrderCreateContext };
