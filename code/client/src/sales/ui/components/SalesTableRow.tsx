import React from 'react';
import { TableRow, TableCell } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Printer, Edit, Trash2 } from 'lucide-react';
import { Sale } from '@/sales/types';
import { formatNumber } from '@/shared/utils/format';
import { format } from 'date-fns';

interface SalesTableRowProps {
    sale: Sale;
    currency: string;
    onViewReceipt: (sale: Sale) => void;
    onEditSale: (sale: Sale) => void;
    onDeleteSale: (sale: Sale) => void;
}

const SalesTableRow: React.FC<SalesTableRowProps> = ({
    sale,
    currency,
    onViewReceipt,
    onEditSale,
    onDeleteSale
}) => {
    // Calculate totals
    const totalQuantity = sale.items.reduce((total, item) => total + item.quantity, 0);
    const totalItemsPrice = sale.items.reduce((total, item) => total + item.sellingPrice, 0);
    const averagePrice = totalQuantity > 0 ? totalItemsPrice / sale.items.length : 0;

    // Calculate subtotal (already in sale.subtotal)
    const subtotal = sale.subtotal;

    // Total discount
    const totalDiscount = sale.discount;

    // Tax amount (already in sale.taxAmount)
    const taxAmount = sale.taxAmount;

    // Total including tax (already in sale.total)
    const saleTotal = sale.total;

    // Calculate total cost
    const totalCost = sale.items.reduce((total, item) => total + (item.unitCost * item.quantity), 0);

    // Get items description
    let itemsDescription = "No items";
    if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
        itemsDescription = sale.items[0].productName;
        if (sale.items.length > 1) {
            itemsDescription += ` (+${sale.items.length - 1} more)`;
        }
    }

    // Get status styling
    const getStatusStyling = () => {
        switch (sale.paymentStatus) {
            case 'PAID':
                return 'bg-green-100 text-green-800';
            case 'QUOTE':
                return 'bg-purple-100 text-purple-800';
            case 'INSTALLMENT':
                return 'bg-blue-100 text-blue-800';
            case 'UNPAID':
            case 'PARTIAL':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <TableRow
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => onViewReceipt(sale)}
        >
            <TableCell className="font-medium">
                {format(new Date(sale.date), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell>{sale.saleNumber}</TableCell>
            <TableCell>
                <div className="space-y-1">
                    <div>{sale.customerName}</div>
                    {sale.cashAccountId && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Cash Account
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <span className="line-clamp-1">
                    {itemsDescription}
                </span>
            </TableCell>
            <TableCell className="text-right">{totalQuantity}</TableCell>
            <TableCell className="text-right">
                {currency} {formatNumber(averagePrice)}
            </TableCell>
            <TableCell className="text-right">
                {totalDiscount > 0 ? (
                    <span className="text-orange-600">
                        -{currency} {formatNumber(totalDiscount)}
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </TableCell>
            <TableCell className="text-right">
                {currency} {formatNumber(totalCost)}
            </TableCell>
            <TableCell className="text-right">
                <span className="text-green-600 font-medium">
                    {currency} {formatNumber(saleTotal - totalCost)}
                </span>
            </TableCell>
            <TableCell className="text-right">
                {currency} {formatNumber(saleTotal)}
                {sale.paymentStatus === 'INSTALLMENT' && sale.amountPaid > 0 && (
                    <div className="text-xs text-green-600">
                        Paid: {currency} {formatNumber(sale.amountPaid)}
                    </div>
                )}
            </TableCell>
            <TableCell>
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyling()}`}
                >
                    {sale.paymentStatus}
                </span>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewReceipt(sale);
                        }}
                    >
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">View Receipt</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditSale(sale);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Sale</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSale(sale);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Sale</span>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default SalesTableRow;
