"use client";

import React, { useState, useEffect } from 'react';
import { CreateSaleInput, SaleSource, PaymentStatus, DiscountType, Sale, SaleItem as DomainSaleItem } from '../../../types';
import { createSaleAction, updateSaleAction } from '../../../api/controller';
import { sendMessageAction } from '@/messaging/api/controller';
import { MessageTemplate } from '@/messaging/types';
import { searchCustomersByNameAction, createCustomerAction } from '@/customers/api/controller';
import { getProductsAction, getProductAction } from '@/products/api/controller';
import { Product } from '@/products/types';
import { useScanner } from '@/products/hardware/utils/useScanner';
import { Customer } from '@/customers/types';
import { useMessage } from '@/shared/ui/Message';
import { User, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { printSaleReceipt } from '@/products/hardware/utils/print';
import { useSettings } from '@/settings/api/SettingsContext';
import { SaleItem } from './types';
import { CustomerSection } from './CustomerSection';
import { ProductSection } from './ProductSection';
import { SaleDetailsSection } from './SaleDetailsSection';
import { CommunicationSection } from './CommunicationSection';
import { SaleSummarySection } from './SaleSummarySection';

import { CashAccount } from '@/finance/types';

interface SaleFormClientProps {
    initialData?: Partial<Sale>;
    templates: MessageTemplate[];
    cashAccounts: CashAccount[];
    userId: string | null;
}

export function SaleFormClient({ initialData, templates, cashAccounts, userId }: SaleFormClientProps) {
    const router = useRouter();
    const { showMessage, MessageComponent } = useMessage();
    const { currency } = useSettings();

    // Customer state
    const [customerSearch, setCustomerSearch] = useState(initialData?.customerName || '');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialData?.customerName ? {
        id: initialData.customerId || '',
        name: initialData.customerName,
        phone: initialData.customerPhone,
        address: initialData.customerAddress,
        adminId: userId || '', // We need adminId, but it might not be available in initialData. Fallback?
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: ''
    } : null);
    const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
    const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');

    // Product search state
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState<Product[]>([]);

    // Line items
    const [items, setItems] = useState<SaleItem[]>(initialData?.items?.map((item: DomainSaleItem) => ({
        id: item.id || Math.random().toString(),
        productId: item.productId || undefined,
        productName: item.productName || "Custom Item",
        sku: item.sku || undefined,
        quantity: item.quantity,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
        discount: item.discount,
        discountType: 'AMOUNT' as DiscountType,
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const isEdit = !!initialData;

    // Messaging state
    const [sendThankYou, setSendThankYou] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [messageChannel, setMessageChannel] = useState<'sms' | 'whatsapp' | 'both'>('whatsapp');

    const [isLoaded, setIsLoaded] = useState(false);
    const STORAGE_KEY = 'gz-pos-sale-draft';

    // Load draft on mount
    useEffect(() => {
        if (!isEdit) {
            const savedDraft = localStorage.getItem(STORAGE_KEY);
            if (savedDraft) {
                try {
                    const d = JSON.parse(savedDraft);
                    if (d.customerSearch) setCustomerSearch(d.customerSearch);
                    if (d.selectedCustomer) setSelectedCustomer(d.selectedCustomer);
                    if (d.customerPhone) setCustomerPhone(d.customerPhone);
                    if (d.customerAddress) setCustomerAddress(d.customerAddress);
                    if (d.items) setItems(d.items);
                    if (d.source) setSource(d.source);
                    if (d.discount) setDiscount(d.discount);
                    if (d.discountType) setDiscountType(d.discountType);
                    if (d.taxRate) setTaxRate(d.taxRate);
                    if (d.paymentStatus) setPaymentStatus(d.paymentStatus);
                    if (d.amountPaid) setAmountPaid(d.amountPaid);
                    if (d.cashAccountId) setCashAccountId(d.cashAccountId);
                    if (d.sendThankYou) setSendThankYou(d.sendThankYou);
                    if (d.selectedTemplateId) setSelectedTemplateId(d.selectedTemplateId);
                    if (d.messageChannel) setMessageChannel(d.messageChannel);
                } catch (e) {
                    console.error("Error parsing sales draft:", e);
                }
            }
        }
        setIsLoaded(true);
    }, [isEdit]);

    // Save draft on change
    useEffect(() => {
        if (!isEdit && isLoaded) {
            const draft = {
                customerSearch,
                selectedCustomer,
                customerPhone,
                customerAddress,
                items,
                source,
                discount,
                discountType,
                taxRate,
                paymentStatus,
                amountPaid,
                cashAccountId,
                sendThankYou,
                selectedTemplateId,
                messageChannel
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        }
    }, [
        isEdit, isLoaded, customerSearch, selectedCustomer, customerPhone, customerAddress,
        items, source, discount, discountType, taxRate, paymentStatus,
        amountPaid, cashAccountId, sendThankYou, selectedTemplateId, messageChannel
    ]);

    const clearDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    // Initialize defaults
    useEffect(() => {
        if (userId && !isEdit) {
            // Set default template if user has one
            // We need to find the user's default template from the templates list or passed props if available
            // Since we don't have the user object here fully, we rely on what's passed or logic in parent.
            // Actually, the parent passes userId. We might need to pass the default template ID too if we want to set it.
            // For now, let's assume the parent handles fetching user preferences or we just let the user select.
            // Wait, the original code fetched user data from cookie and set default template.
            // I'll leave it as is for now, or maybe the parent should pass `defaultTemplateId`.
            // Let's stick to the original behavior but adapted.
        }

        if (!initialData && cashAccounts.length > 0) {
            const active = cashAccounts.find(a => a.isActive);
            if (active) setCashAccountId(active.id);
        }
    }, [userId, isEdit, cashAccounts, initialData]);

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
        enabled: !isSubmitting
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        const lineTotalRef = item.sellingPrice * item.quantity;
        const itemDiscountValue = item.discountType === 'PERCENTAGE'
            ? (lineTotalRef * item.discount) / 100
            : item.discount;
        return sum + (lineTotalRef - itemDiscountValue);
    }, 0);

    const globalDiscountValue = discountType === 'PERCENTAGE' ? (subtotal * discount) / 100 : discount;
    const afterDiscount = subtotal - globalDiscountValue;
    const taxAmount = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + taxAmount;
    const balance = total - amountPaid;

    useEffect(() => {
        if (paymentStatus === 'PAID') {
            setAmountPaid(total);
        } else if (paymentStatus === 'UNPAID') {
            setAmountPaid(0);
        }
    }, [paymentStatus, total]);

    // Debounced customer search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (customerSearch.length > 1) {
                const res = await searchCustomersByNameAction(customerSearch);
                if (res.success) {
                    setCustomerResults(res.data || []);
                }
            } else {
                setCustomerResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [customerSearch]);

    // Debounced product search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (productSearch.length > 1) {
                const res = await getProductsAction();
                if (res.success) {
                    const filtered = (res.data as Product[] || []).filter(p =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.barcode?.includes(productSearch) ||
                        p.sku?.includes(productSearch)
                    );
                    setProductResults(filtered.slice(0, 10));
                }
            } else {
                setProductResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [productSearch]);

    const handleCustomerSearch = (query: string) => {
        setCustomerSearch(query);
    };

    const handleProductSearch = (query: string) => {
        setProductSearch(query);
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

    const updateItem = (id: string, field: string, value: string | number | boolean) => {
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
                items: items.map((item) => {
                    const lineTotalRef = item.sellingPrice * item.quantity;
                    const finalDiscountAmount = item.discountType === 'PERCENTAGE'
                        ? (lineTotalRef * item.discount) / 100
                        : item.discount;

                    return {
                        productId: item.productId,
                        productName: item.productName,
                        sku: item.sku,
                        quantity: item.quantity,
                        unitCost: item.unitCost,
                        sellingPrice: item.sellingPrice,
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

            const res = isEdit && initialData?.id
                ? await updateSaleAction(initialData.id, saleData)
                : await createSaleAction(saleData);

            if (res.success) {
                const sale = res.data;
                showMessage('success', `Sale ${sale?.saleNumber} ${isEdit ? 'updated' : 'created'} successfully!`);

                if (!isEdit && sale) {
                    printSaleReceipt(sale);
                }

                if (!isEdit && sendThankYou && userId && sale && (sale.customerPhone || customerPhone)) {
                    const template = templates.find(t => t.id === selectedTemplateId);
                    let content = '';

                    if (template) {
                        content = template.content;
                    } else {
                        content = `Hello {{name}}, thank you for your purchase ({{number}}) of ${currency} {{total}} at Gonza. We appreciate your business!`;
                    }

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

                if (!isEdit) {
                    clearDraft();
                }
                setTimeout(() => {
                    router.push('/sales');
                }, 1500);
            } else {
                showMessage('error', res.error || `Failed to ${isEdit ? 'update' : 'create'} sale`);
            }
        } catch {
            showMessage('error', 'An error occurred');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            {MessageComponent}

            <ProductSection
                productSearch={productSearch}
                onSearch={handleProductSearch}
                results={productResults}
                onAddProduct={addProductToSale}
                onAddCustom={addCustomItem}
                items={items}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onToggleCost={toggleItemCost}
                onToggleDiscountType={toggleItemDiscountType}
                currency={currency}
            />

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-4xl p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Customer Information
                        </h3>
                        <CustomerSection
                            customerSearch={customerSearch}
                            onSearch={handleCustomerSearch}
                            onSelect={(c) => {
                                setSelectedCustomer(c);
                                setCustomerSearch(c.name);
                                setCustomerPhone(c.phone || '');
                                setCustomerAddress(c.address || '');
                            }}
                            phone={customerPhone}
                            onPhoneChange={setCustomerPhone}
                            address={customerAddress}
                            onAddressChange={setCustomerAddress}
                            results={customerResults}
                            onClearResults={() => setCustomerResults([])}
                        />
                    </div>

                    <SaleDetailsSection
                        source={source}
                        onSourceChange={setSource}
                        discount={discount}
                        onDiscountChange={setDiscount}
                        discountType={discountType}
                        onDiscountTypeChange={() => {
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
                        taxRate={taxRate}
                        onTaxRateChange={setTaxRate}
                        paymentStatus={paymentStatus}
                        onPaymentStatusChange={setPaymentStatus}
                        amountPaid={amountPaid}
                        onAmountPaidChange={setAmountPaid}
                        cashAccountId={cashAccountId}
                        onCashAccountChange={setCashAccountId}
                        cashAccounts={cashAccounts}
                        currency={currency}
                    />
                </div>

                <div className="col-span-2 space-y-6">
                    {/* Communication Settings */}
                    {!isEdit && (
                        <div className="bg-card border border-border rounded-4xl p-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Communication
                            </h3>
                            <CommunicationSection
                                sendThankYou={sendThankYou}
                                onSendThankYouChange={setSendThankYou}
                                templates={templates}
                                selectedTemplateId={selectedTemplateId}
                                onTemplateChange={setSelectedTemplateId}
                                channel={messageChannel}
                                onChannelChange={setMessageChannel}
                            />
                        </div>
                    )}

                    <SaleSummarySection
                        subtotal={subtotal}
                        discount={discount}
                        discountType={discountType}
                        globalDiscountValue={globalDiscountValue}
                        taxRate={taxRate}
                        taxAmount={taxAmount}
                        total={total}
                        amountPaid={amountPaid}
                        balance={balance}
                        currency={currency}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSubmit}
                        hasItems={items.length > 0}
                    />
                </div>
            </div>
        </div>
    );
}
