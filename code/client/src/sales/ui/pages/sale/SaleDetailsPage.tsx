import React from 'react';
import { Sale } from '../../../types';
import { Calendar, User, Phone, MapPin, Receipt, Clock, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteSaleButton } from './components/DeleteSaleButton';
import { PrintReceiptButton } from './components/PrintReceiptButton';
import { BackButton } from './components/BackButton';
import Link from 'next/link';

interface SaleDetailsPageProps {
    sale: Sale;
    currency: string;
}

export const SaleDetailsPage: React.FC<SaleDetailsPageProps> = ({ sale, currency }) => {
    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground h-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider">{sale.source}</span>
                            <span className="text-xs">/</span>
                            <span className="text-[10px] font-medium">{sale.saleNumber}</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            Sale Details
                            <PaymentStatusBadge status={sale.paymentStatus} />
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/sales/edit?id=${sale.id}`}
                        className="px-5 py-2.5 text-sm font-bold text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-all flex items-center gap-2"
                    >
                        <Edit3 className="h-4 w-4" />
                        Edit
                    </Link>
                    <DeleteSaleButton saleId={sale.id} />
                    <PrintReceiptButton sale={sale} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Customer</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black">{sale.customerName}</h3>
                                <div className="mt-2 space-y-1">
                                    {sale.customerPhone && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> {sale.customerPhone}
                                        </p>
                                    )}
                                    {sale.customerAddress && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <MapPin className="h-3 w-3" /> {sale.customerAddress}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Date & Time</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black">{format(new Date(sale.date), 'MMMM d, yyyy')}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                                    <Clock className="h-3 w-3" /> {format(new Date(sale.date), 'h:mm a')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary" />
                                <h3 className="font-bold text-sm uppercase tracking-wider">Sale Items</h3>
                            </div>
                            <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black">{sale.items.length} Items</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/30 text-left">
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
                                        <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Qty</th>
                                        <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Price</th>
                                        <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-muted-foreground">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {sale.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold">
                                                {item.productName || "Custom Item"}
                                                {item.sku && <p className="text-[10px] text-muted-foreground font-medium">{item.sku}</p>}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                <span className="font-black underline decoration-primary/20 decoration-2 underline-offset-4">{item.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                {item.sellingPrice.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-black">
                                                {item.lineTotal.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Totals */}
                <div className="space-y-6">
                    <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20 space-y-6 relative overflow-hidden">
                        <Receipt className="absolute -right-4 -top-4 h-32 w-32 text-white/10 -rotate-12" />

                        <div className="space-y-1 relative">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Total Amount</p>
                            <h2 className="text-4xl font-black">{currency} {sale.total.toLocaleString()}</h2>
                        </div>

                        <div className="pt-6 border-t border-white/20 space-y-4 relative">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-white/70">Subtotal</span>
                                <span className="text-sm font-black">{currency} {sale.subtotal.toLocaleString()}</span>
                            </div>
                            {sale.discount > 0 && (
                                <div className="flex justify-between items-center text-white/90">
                                    <span className="text-xs font-bold">Global Discount ({sale.discountType === 'PERCENTAGE' ? 'Value' : 'Amt'})</span>
                                    <span className="text-sm font-black">- {sale.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-white/70">Tax ({sale.taxRate}%)</span>
                                <span className="text-sm font-black">+ {sale.taxAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/20 space-y-4 relative">
                            <div className="flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-white/70">Amount Paid</span>
                                    <p className="text-[10px] font-black uppercase text-white/40">{sale.paymentStatus}</p>
                                </div>
                                <span className="text-lg font-black">{sale.amountPaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-white/70">Balance Due</span>
                                <span className={`text-lg font-black ${sale.balance > 0 ? 'text-red-200' : 'text-emerald-200'}`}>
                                    {sale.balance.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-muted/30 border border-dashed border-border rounded-3xl text-center space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Sale ID</p>
                        <code className="text-[10px] bg-background px-3 py-1.5 rounded-full border border-border inline-block">{sale.id}</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

function PaymentStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PAID: 'bg-emerald-500/10 text-emerald-600',
        UNPAID: 'bg-red-500/10 text-red-600',
        PARTIAL: 'bg-orange-500/10 text-orange-600',
        QUOTE: 'bg-blue-500/10 text-blue-600',
        INSTALLMENT: 'bg-purple-500/10 text-purple-600',
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-current transition-all ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}
