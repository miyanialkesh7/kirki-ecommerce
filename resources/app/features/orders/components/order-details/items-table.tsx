import Flex from '@/components/ui/flex';
import Image from '@/components/ui/image';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Text from '@/components/ui/text';
import type { Order } from '@/features/orders/schemas/catalog/order';
import { sprintf } from '@/wpi18n';

type ItemsTableProps = {
  items: Order['items'];
  isTaxInclusive: boolean;
};

const ItemsTable = ({ items, isTaxInclusive }: ItemsTableProps) => {
  return (
    <Table>
      <TableBody>
        {items.map((item) => {
          const subtotal = isTaxInclusive
            ? item.base_subtotal_inclusive_money_object
            : item.base_subtotal_exclusive_money_object;

          return (
            <TableRow key={item.id}>
              <TableCell>
                <Flex gap={3} align="center">
                  <Image src={item.image} alt={item.product_name ?? undefined} />
                  <Flex direction="column" gap={2}>
                    <Text variant="small">{item.product_name}</Text>
                    {Boolean(item.variant_name) && (
                      <Text variant="small" color="secondary">
                        {item.variant_name}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              </TableCell>
              <TableCell alignment="right">
                <Text color="subdued" variant="small" weight="medium">
                  {sprintf('Qty: %s', item.quantity)}
                </Text>
              </TableCell>
              <TableCell alignment="right">
                <Text variant="tiny" weight="medium">
                  {subtotal.display}
                </Text>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

ItemsTable.displayName = 'ItemsTable';

export default ItemsTable;
