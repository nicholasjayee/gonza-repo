"use client";

import React, { useState, useEffect } from 'react';
import { CreateSaleInput, CreateSaleItemInput, SaleSource, PaymentStatus, DiscountType } from '../../types';
import { createSaleAction, updateSaleAction, getSalesAction } from '../../api/controller';
import { getTemplatesAction, sendMessageAction } from '@/messaging/api/controller';
import { MessageTemplate } from '@/messaging/types';
import { searchCustomersByNameAction, createCustomerAction } from '@/customers/api/controller';
import { getProductsAction, getProductAction } from '@/products/api/controller';
import { Product } from '@/products/types';
import { useScanner } from '@/products/hardware/utils/useScanner';
import { Customer } from '@/customers/types';
import { useMessage } from '@/shared/ui/Message';
import { Search, Plus, X, Trash2, Save, Loader2, User, Package, Settings, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { printSaleReceipt } from '@/products/hardware/utils/print';
import { MessageSquare, Mail, Send, Wallet } from 'lucide-react';
import { getCashAccountsAction } from '@/finance/api/controller';
import { useSettings } from '@/settings/api/SettingsContext';

interface SaleFormProps {
    initialData?: any;
}

export function SaleForm({ initialData }: SaleFormProps) {
    const router = useRouter();
    const { showMessage, MessageComponent } = useMessage();
    const { currency } = useSettings();


    // Customer state
    const [customerSearch, setCustomerSearch] = useState(initialData?.customerName || '');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialData?.customer as any || null);
    const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
    const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');

    // Product search state
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState<Product[]>([]);

    // Line items - Extended with UI state for cost editing and discount type
    const [items, setItems] = useState<(CreateSaleItemInput & {
        id: string;
        showCostUI?: boolean;
        discountType: DiscountType;
    })[]>(initialData?.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId || undefined,
        productName: item.product?.name || "Custom Item",
        sku: item.product?.sku || undefined,
        quantity: item.quantity,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
        discount: item.discount, // This is the absolute amount from DB
        discountType: 'AMOUNT' as DiscountType, // Default to amount for existing items
        showCostUI: false
    })) || []);

    // Global Sale details
    const [source, setSource] = useState<SaleSource>(initialData?.source || 'WALK_IN');
    const [discount, setDiscount] = useState(initialData?.discount || 0);
    const [discountType, setDiscountType] = useState<DiscountType>(initialData?.discountType || 'AMOUNT');
    const [taxRate, setTaxRate] = useState(initialData?.taxRate || 0);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialData?.paymentStatus || 'PAID');
    const [amountPaid, setAmountPaid] = useState(initialData?.amountPaid || 0);
    const [cashAccountId, setCashAccountId] = useState<string>(initialData?.cashAccountId || '');
    const [cashAccounts, setCashAccounts] = useState<any[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const isEdit = !!initialData;

    // Messaging state
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [sendThankYou, setSendThankYou] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [messageChannel, setMessageChannel] = useState<'sms' | 'whatsapp' | 'both'>('whatsapp');
    const [userId, setUserId] = useState<string | null>(null);

    const handleBarcodeScan = async (barcode: string) => {
        if (isScanning) return;
        setIsScanning(true);
        try {
            const res = await getProductAction(barcode);
            if (res.success && res.data) {
                addProductToSale(res.data as Product);
                showMessage('success', `Added ${res.data.name} via barcode`);
            } else {
                showMessage('error', `Product with barcode ${barcode} not found`);
            }
        } catch (error) {
            console.error("Barcode scan error:", error);
        } finally {
            setIsScanning(false);
        }
    };

    useScanner({
        onScan: handleBarcodeScan,
        enabled: !isSubmitting && !isScanning
    });

    useEffect(() => {
        const userDataStr = document.cookie
            .split('; ')
            .find(row => row.startsWith('userData='))
            ?.split('=')[1];

        if (userDataStr) {
            try {
                const decodedData = decodeURIComponent(userDataStr);
                const user = JSON.parse(decodedData);
                setUserId(user.id);

                // Fetch templates
                getTemplatesAction(user.id).then(res => {
                    if (res.success) {
                        setTemplates(res.data || []);
                        if (user.defaultThankYouTemplateId) {
                            setSelectedTemplateId(user.defaultThankYouTemplateId);
                            setSendThankYou(true);
                        }
                    }
                });

                // Fetch cash accounts
                getCashAccountsAction().then(res => {
                    if (res.success) {
                        setCashAccounts(res.data as any[] || []);
                        if (!initialData && res.data && (res.data as any[]).length > 0) {
                            // Default to first active account
                            const active = (res.data as any[]).find(a => a.isActive);
                            if (active) setCashAccountId(active.id);
                        }
                    }
                });
            } catch (error) {
                console.error('Error parsing userData cookie:', error);
            }
        }
    }, []);

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        const lineTotalRef = item.sellingPrice * item.quantity;
        const itemDiscountValue = item.discountType === 'PERCENTAGE'
            ? (lineTotalRef * item.discount) / 100
            : item.discount;
        return sum + (lineTotalRef - itemDiscountValue);
    }, 0);

    // Calculate final global discount value (applied after subtotal)
    const globalDiscountValue = discountType === 'PERCENTAGE' ? (subtotal * discount) / 100 : discount;

    const afterDiscount = subtotal - globalDiscountValue;
    const taxAmount = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + taxAmount;
    const balance = total - amountPaid;

    // Auto-update amount paid when status or total changes
    useEffect(() => {
        if (paymentStatus === 'PAID') {
            setAmountPaid(total);
        } else if (paymentStatus === 'UNPAID') {
            setAmountPaid(0);
        }
    }, [paymentStatus, total]);

    const handleCustomerSearch = async (query: string) => {
        setCustomerSearch(query);
        if (query.length > 1) {
            const res = await searchCustomersByNameAction(query);
            if (res.success) {
                setCustomerResults(res.data || []);
            }
        } else {
            setCustomerResults([]);
        }
    };

    const handleProductSearch = async (query: string) => {
        setProductSearch(query);
        if (query.length > 1) {
            const res = await getProductsAction();
            if (res.success) {
                const filtered = (res.data as Product[] || []).filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.barcode?.includes(query) ||
                    p.sku?.includes(query)
                );
                setProductResults(filtered.slice(0, 10));
            }
        } else {
            setProductResults([]);
        }
    };

    const addProductToSale = (product: Product) => {
        const existing = items.find(i => i.productId === product.id);
        if (existing) {
            setItems(items.map(i =>
                i.productId === product.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setItems([...items, {
                id: Math.random().toString(),
                productId: product.id,
                productName: product.name,
                sku: product.sku || undefined,
                quantity: 1,
                unitCost: product.costPrice,
                sellingPrice: product.sellingPrice,
                discount: 0,
                discountType: 'AMOUNT',
                showCostUI: false
            }]);
        }
        setProductSearch('');
        setProductResults([]);
    };

    const addCustomItem = (name: string, price: number) => {
        if (name && price > 0) {
            setItems(prev => [...prev, {
                id: Math.random().toString(),
                productName: name,
                quantity: 1,
                unitCost: 0,
                sellingPrice: price,
                discount: 0,
                discountType: 'AMOUNT',
                showCostUI: false
            }]);
            setProductSearch('');
            setProductResults([]);
            const priceInput = document.getElementById('customItemPrice') as HTMLInputElement;
            if (priceInput) priceInput.value = '';
        }
    };

    const updateItem = (id: string, field: string, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const toggleItemCost = (id: string) => {
        setItems(items.map(i => i.id === id ? { ...i, showCostUI: !i.showCostUI } : i));
    };

    const toggleItemDiscountType = (id: string) => {
        setItems(items.map(i => {
            if (i.id === id) {
                const lineTotalRef = i.sellingPrice * i.quantity;
                const newType = i.discountType === 'AMOUNT' ? 'PERCENTAGE' : 'AMOUNT';
                let newDiscount = 0;

                if (newType === 'PERCENTAGE') {
                    newDiscount = lineTotalRef > 0 ? (i.discount / lineTotalRef) * 100 : 0;
                } else {
                    newDiscount = (lineTotalRef * i.discount) / 100;
                }

                return { ...i, discountType: newType, discount: newDiscount };
            }
            return i;
        }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleSubmit = async () => {
        if (!selectedCustomer && !customerSearch) {
            showMessage('error', 'Please select or create a customer');
            return;
        }

        if (items.length === 0) {
            showMessage('error', 'Please add at least one product');
            return;
        }

        setIsSubmitting(true);

        try {
            let customerId = selectedCustomer?.id;
            let customerName = selectedCustomer?.name || customerSearch;

            if (!selectedCustomer && customerSearch) {
                const res = await createCustomerAction({
                    name: customerSearch,
                    phone: customerPhone,
                    address: customerAddress
                });
                if (res.success && res.data) {
                    customerId = res.data.id;
                    customerName = res.data.name;
                } else {
                    showMessage('error', res.error || 'Failed to create new customer');
                    setIsSubmitting(false);
                    return;
                }
            }

            const saleData: CreateSaleInput = {
                customerId,
                customerName,
                customerPhone: customerPhone || selectedCustomer?.phone || undefined,
                customerAddress: customerAddress || selectedCustomer?.address || undefined,
                source,
                items: items.map(({ id, showCostUI, discountType, ...item }) => {
                    const lineTotalRef = item.sellingPrice * item.quantity;
                    const finalDiscountAmount = discountType === 'PERCENTAGE'
                        ? (lineTotalRef * item.discount) / 100
                        : item.discount;

                    return {
                        ...item,
                        discount: finalDiscountAmount
                    };
                }),
                discount,
                discountType,
                taxRate,
                paymentStatus,
                amountPaid,
                cashAccountId: cashAccountId || undefined
            };

            const res = isEdit
                ? await updateSaleAction(initialData!.id, saleData)
                : await createSaleAction(saleData);

            if (res.success) {
                const sale = res.data;
                showMessage('success', `Sale ${sale?.saleNumber} ${isEdit ? 'updated' : 'created'} successfully!`);

                // Automatically print receipt for new sales
                if (!isEdit && sale) {
                    printSaleReceipt(sale);
                }

                // Send Thank You Message
                if (!isEdit && sendThankYou && userId && sale && (sale.customerPhone || customerPhone)) {
                    const template = templates.find(t => t.id === selectedTemplateId);
                    let content = '';

                    if (template) {
                        content = template.content;
                    } else {
                        // Built-in fallback template
                        content = `Hello {{name}}, thank you for your purchase ({{number}}) of ${currency} {{total}} at Gonza. We appreciate your business!`;
                    }

                    // Replace variables
                    const processedContent = content
                        .replace(/{{name}}/g, customerName)
                        .replace(/{{total}}/g, total.toLocaleString())
                        .replace(/{{number}}/g, sale.saleNumber);

                    sendMessageAction({
                        userId,
                        recipients: [sale.customerPhone || customerPhone],
                        content: processedContent,
                        channel: messageChannel
                    });
                }

                setTimeout(() => {
                    router.push('/sales');
                }, 1500);
            } else {
                showMessage('error', res.error || `Failed to ${isEdit ? 'update' : 'create'} sale`);
            }
        } catch (error) {
            showMessage('error', 'An error occurred');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            {MessageComponent}

            {/* Customer Section */}
            <div className="bg-card border border-border rounded-[2rem] p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Information
                </h3>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                            placeholder="Search or create customer..."
                            className="w-full h-12 px-4 pl-11 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                        {customerResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto z-10">
                                {customerResults.map(customer => (
                                    <button
                                        key={customer.id}
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setCustomerSearch(customer.name);
                                            setCustomerPhone(customer.phone || '');
                                            setCustomerAddress(customer.address || '');
                                            setCustomerResults([]);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                                    >
                                        <p className="font-bold text-sm">{customer.name}</p>
                                        {customer.phone && <p className="text-xs text-muted-foreground">{customer.phone}</p>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Phone (optional)"
                            className="h-10 px-3 rounded-lg bg-muted/30 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                        />
                        <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Address (optional)"
                            className="h-10 px-3 rounded-lg bg-muted/30 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Product Section */}
            <div className="bg-card border border-border rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Package className="w-4 h-4" /> Add Products
                    </h3>
                </div>

                <div className="flex gap-2 relative">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => handleProductSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    document.getElementById('customItemPrice')?.focus();
                                }
                            }}
                            placeholder="Search product or enter custom item name..."
                            className="w-full h-12 px-4 pl-11 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                        {productResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl max-h-64 overflow-y-auto z-10">
                                {productResults.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addProductToSale(product)}
                                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-bold text-sm">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.sku} • Stock: {product.stock}
                                            </p>
                                        </div>
                                        <p className="font-black text-primary">{currency} {product.sellingPrice.toLocaleString()}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <div className="w-32 relative">
                            <label className="absolute -top-2 left-2 text-[8px] font-black uppercase tracking-wider bg-card px-1 text-muted-foreground">Price</label>
                            <input
                                type="number"
                                id="customItemPrice"
                                placeholder="0"
                                className="w-full h-12 px-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const priceInput = document.getElementById('customItemPrice') as HTMLInputElement;
                                        const price = parseFloat(priceInput.value);
                                        addCustomItem(productSearch, price);
                                    }
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                const priceInput = document.getElementById('customItemPrice') as HTMLInputElement;
                                const price = parseFloat(priceInput.value);
                                addCustomItem(productSearch, price);
                            }}
                            className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="mt-8">
                        <div className="grid grid-cols-12 gap-4 px-3 py-2 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <div className="col-span-4">Product</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Disc.</div>
                            <div className="col-span-1 text-right">Total</div>
                            <div className="col-span-1"></div>
                        </div>

                        <div className="divide-y divide-border/50">
                            {items.map((item) => {
                                const lineTotalRef = item.sellingPrice * item.quantity;
                                const itemDiscountValue = item.discountType === 'PERCENTAGE'
                                    ? (lineTotalRef * item.discount) / 100
                                    : item.discount;

                                return (
                                    <div key={item.id} className="py-3 px-3 hover:bg-muted/30 transition-colors group">
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-4">
                                                <p className="font-bold text-sm text-foreground">{item.productName}</p>
                                                {item.sku && <p className="text-[10px] text-muted-foreground">{item.sku}</p>}
                                            </div>

                                            <div className="col-span-2 flex justify-center">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="w-16 h-8 px-2 text-center text-sm font-bold rounded-lg bg-background border border-border focus:border-primary/50 outline-none"
                                                    min="1"
                                                />
                                            </div>

                                            <div className="col-span-2 flex justify-end">
                                                <input
                                                    type="number"
                                                    value={item.sellingPrice}
                                                    onChange={(e) => updateItem(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                                                    className="w-20 h-8 px-2 text-right text-sm font-bold rounded-lg bg-background border border-border focus:border-primary/50 outline-none"
                                                />
                                            </div>

                                            {/* Per-Item Discount Input with Toggle */}
                                            <div className="col-span-2 flex justify-end">
                                                <div className="relative w-20">
                                                    <input
                                                        type="number"
                                                        value={item.discount}
                                                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                                        placeholder="0"
                                                        className="w-full h-8 px-2 text-right text-sm rounded-lg bg-background border border-border focus:border-primary/50 outline-none placeholder:text-muted-foreground/30"
                                                    />
                                                    <button
                                                        onClick={() => toggleItemDiscountType(item.id)}
                                                        className="absolute -top-2 -right-1 h-4 px-1 bg-card text-[8px] border border-border rounded font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                                                        tabIndex={-1}
                                                    >
                                                        {item.discountType === 'PERCENTAGE' ? '%' : currency}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-span-1 text-right">
                                                <p className="font-black text-sm text-primary">
                                                    {(lineTotalRef - itemDiscountValue).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleItemCost(item.id)}
                                                    className={`p-2 rounded-lg transition-colors ${item.showCostUI ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                                                    title="Edit Cost"
                                                >
                                                    {item.showCostUI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {item.showCostUI && (
                                            <div className="mt-3 pl-[33%] pr-[8%]">
                                                <div className="bg-muted/40 p-2 rounded-lg border border-border/50 flex gap-4 items-center justify-end">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Unit Cost:</span>
                                                        <input
                                                            type="number"
                                                            value={item.unitCost}
                                                            onChange={(e) => updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                                            className="w-20 h-7 px-2 text-xs font-bold rounded bg-background border border-border focus:border-primary/50 outline-none"
                                                        />
                                                    </div>
                                                    <div className="w-px h-4 bg-border/50" />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Total Cost:</span>
                                                        <input
                                                            type="number"
                                                            value={item.unitCost * item.quantity}
                                                            onChange={(e) => {
                                                                const totalCost = parseFloat(e.target.value) || 0;
                                                                const newUnitCost = item.quantity > 0 ? totalCost / item.quantity : totalCost;
                                                                updateItem(item.id, 'unitCost', newUnitCost);
                                                            }}
                                                            className="w-24 h-7 px-2 text-xs font-bold rounded bg-background border border-border focus:border-primary/50 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Sales Details & Totals */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left: Input Section (Sale Info & Payment) */}
                <div className="col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-[2rem] p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                            <Settings className="w-4 h-4" /> Sale Info
                        </h3>

                        <div className="space-y-4">
                            {/* Source */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground mb-1 block">Source</label>
                                <select
                                    value={source}
                                    onChange={(e) => setSource(e.target.value as SaleSource)}
                                    className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm"
                                >
                                    <option value="WALK_IN">Walk-in</option>
                                    <option value="PHONE">Phone</option>
                                    <option value="ONLINE">Online</option>
                                    <option value="REFERRAL">Referral</option>
                                    <option value="RETURNING">Returning</option>
                                </select>
                            </div>

                            {/* Global Discount Input */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground mb-1 block">
                                    Global Discount
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm font-bold"
                                        placeholder="0"
                                    />
                                    <button
                                        onClick={() => {
                                            if (discountType === 'PERCENTAGE') {
                                                const amount = (subtotal * discount) / 100;
                                                setDiscount(amount);
                                                setDiscountType('AMOUNT');
                                            } else {
                                                const percent = subtotal > 0 ? (discount / subtotal) * 100 : 0;
                                                setDiscount(percent);
                                                setDiscountType('PERCENTAGE');
                                            }
                                        }}
                                        className="absolute right-1 top-1 h-8 px-2 bg-background border border-border rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-muted transition-colors"
                                    >
                                        {discountType === 'PERCENTAGE' ? '%' : currency}
                                    </button>
                                </div>
                            </div>

                            {/* Tax Rate */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground mb-1 block">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                    className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm"
                                    placeholder="0"
                                />
                            </div>

                            {/* Payment Status */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground mb-1 block">Payment Status</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                                    className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm"
                                >
                                    <option value="PAID">Paid</option>
                                    <option value="UNPAID">Unpaid</option>
                                    <option value="QUOTE">Quote (No Stock Deduction)</option>
                                    <option value="INSTALLMENT">Installment</option>
                                    <option value="PARTIAL">Partial</option>
                                </select>
                            </div>

                            {/* Amount Paid Input */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground mb-1 block">Amount Paid</label>
                                <input
                                    type="number"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm font-bold text-emerald-600"
                                    disabled={paymentStatus === 'PAID' || paymentStatus === 'UNPAID'}
                                />
                            </div>

                            {/* Cash Account Selector */}
                            <div>
                                <label className="text-xs font-bold text-muted-foreground mb-1 block flex items-center gap-1">
                                    <Wallet className="w-3 h-3 text-primary" /> Destination Cash Account
                                </label>
                                <select
                                    value={cashAccountId}
                                    onChange={(e) => setCashAccountId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-sm font-bold"
                                >
                                    <option value="">-- No Account (General) --</option>
                                    {cashAccounts.filter(a => a.isActive || a.id === cashAccountId).map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} ({Number(acc.currentBalance).toLocaleString()} {currency})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-muted-foreground mt-1 italic">
                                    The sale total will be credited to this account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Read-only Summary + Communication */}
                <div className="col-span-2 space-y-6">
                    {/* Communication Settings */}
                    {!isEdit && (
                        <div className="bg-card border border-border rounded-[2rem] p-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Communication
                            </h3>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-10 h-6 rounded-full transition-all relative ${sendThankYou ? 'bg-primary' : 'bg-muted'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sendThankYou ? 'left-5' : 'left-1'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={sendThankYou}
                                        onChange={() => setSendThankYou(!sendThankYou)}
                                    />
                                    <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">Send Thank You Message</span>
                                </label>

                                {sendThankYou && (
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Select Template</label>
                                            <select
                                                value={selectedTemplateId}
                                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl bg-muted/30 border border-border text-xs font-bold"
                                            >
                                                <option value="">Choose a template...</option>
                                                {templates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Channel</label>
                                            <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border">
                                                {(['whatsapp', 'sms', 'both'] as const).map(ch => (
                                                    <button
                                                        key={ch}
                                                        onClick={() => setMessageChannel(ch)}
                                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${messageChannel === ch ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                                    >
                                                        {ch}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-[2rem] p-6 h-fit">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-black">{currency} {subtotal.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Discount ({discountType === 'PERCENTAGE' ? `${discount}%` : 'Flat'}):</span>
                                <span className="font-black text-orange-500">
                                    - {currency} {globalDiscountValue.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                                <span className="font-black text-foreground">
                                    + {currency} {taxAmount.toLocaleString()}
                                </span>
                            </div>

                            <div className="h-px bg-border my-2" />

                            <div className="flex justify-between text-lg items-center">
                                <span className="font-black">TOTAL:</span>
                                <span className="font-black text-primary">{currency} {total.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Amount Paid:</span>
                                <span className="font-black text-emerald-500">
                                    {currency} {amountPaid.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm items-center pt-2">
                                <span className="text-muted-foreground">Balance:</span>
                                <span className={`font-black ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {currency} {balance.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || items.length === 0}
                            className="w-full h-14 mt-6 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Complete Sale</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
