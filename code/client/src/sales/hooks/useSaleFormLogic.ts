"use client";

import { useState, useCallback } from 'react';
import { SaleItem, FormErrors, SaleFormData } from '@/dashboard/types';
import { useLocalPaymentChanges } from '@/sales/hooks/useLocalPaymentChanges';
import { useInstallmentPayments } from '@/sales/hooks/useInstallmentPayments';

interface UseSaleFormLogicProps {
  initialData?: any;
  defaultPaymentStatus: string;
  cashAccounts: any[];
}

export const useSaleFormLogic = ({
  initialData,
  defaultPaymentStatus,
  cashAccounts
}: UseSaleFormLogicProps) => {
  // Simplified state management for now
  const [formData, setFormData] = useState<SaleFormData>({
    customerName: initialData?.customerName || '',
    customerAddress: initialData?.customerAddress || '',
    customerContact: initialData?.customerContact || '',
    items: initialData?.items || [],
    paymentStatus: initialData?.paymentStatus || defaultPaymentStatus,
    receiptNumber: initialData?.receiptNumber,
    taxRate: initialData?.taxRate || 0,
    amountPaid: initialData?.amountPaid,
    amountDue: initialData?.amountDue,
    notes: initialData?.notes,
    categoryId: initialData?.categoryId,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [taxRateInput, setTaxRateInput] = useState(initialData?.taxRate?.toString() || '0');
  const [printAfterSave, setPrintAfterSave] = useState(false);
  const [includePaymentInfo, setIncludePaymentInfo] = useState(true);
  const [selectedCustomerCategoryId, setSelectedCustomerCategoryId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [linkToCash, setLinkToCash] = useState(false);
  const [selectedCashAccountId, setSelectedCashAccountId] = useState<string>('');
  const [cashTransactionId, setCashTransactionId] = useState<string | null>(null);
  const [originalPaymentStatus, setOriginalPaymentStatus] = useState(initialData?.paymentStatus || defaultPaymentStatus);
  const [formRecentlyCleared, setFormRecentlyCleared] = useState(false);

  // Payment hooks
  const {
    payments,
    createInstallmentPayment,
    updatePayment: updateInstallmentPayment,
    deleteInstallmentPayment,
    loadPayments
  } = useInstallmentPayments(initialData?.id);

  const {
    pendingChanges,
    addPaymentChange,
    clearChanges,
    getModifiedPayments
  } = useLocalPaymentChanges();

  const hasChanges = pendingChanges.length > 0;

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentStatus: value as any }));
  };

  const handleAddItem = () => {
    // Logic to add item
    console.log('Add item');
  };

  const handleUpdateItem = (index: number, updatedItem: SaleItem) => {
    // Logic to update item
    console.log('Update item', index, updatedItem);
  };

  const handleRemoveItem = (index: number) => {
    // Logic to remove item
    console.log('Remove item', index);
  };

  const handleSelectCustomer = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.fullName,
      customerAddress: customer.location || '',
      customerContact: customer.phoneNumber || '',
      categoryId: customer.categoryId,
    }));
    setSelectedCustomerCategoryId(customer.categoryId || '');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCustomerCategoryId(categoryId);
  };

  const handleSalesCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }));
  };

  const handleAmountPaidChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amountPaid: amount }));
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTaxAmount = () => {
    const total = calculateTotalAmount();
    return total * (formData.taxRate || 0) / 100;
  };

  const validateForm = () => {
    // Basic validation
    const newErrors: FormErrors = {};
    if (!formData.customerName) newErrors.customerName = 'Customer name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPendingPaymentChanges = async () => {
    // Logic to process pending changes
    console.log('Processing pending changes');
  };

  const clearForm = useCallback(() => {
    setFormData({
      customerName: '',
      customerAddress: '',
      customerContact: '',
      items: [],
      paymentStatus: defaultPaymentStatus as any,
      taxRate: 0,
    });
    setErrors({});
    setTaxRateInput('0');
    setFormRecentlyCleared(true);
  }, [defaultPaymentStatus]);

  return {
    formData,
    errors,
    taxRateInput,
    printAfterSave,
    includePaymentInfo,
    selectedCustomerCategoryId,
    paymentDate,
    linkToCash,
    selectedCashAccountId,
    cashTransactionId,
    originalPaymentStatus,
    formRecentlyCleared,
    payments,
    pendingChanges,
    hasChanges,

    setFormData,
    setTaxRateInput,
    setPrintAfterSave,
    setIncludePaymentInfo,
    setLinkToCash,
    setSelectedCashAccountId,
    setCashTransactionId,
    setOriginalPaymentStatus,

    handleChange,
    handleSelectChange,
    handleAddItem,
    handleUpdateItem,
    handleRemoveItem,
    handleSelectCustomer,
    handleCategoryChange,
    handleSalesCategoryChange,
    handleAmountPaidChange,
    handlePaymentDateChange: setPaymentDate,
    clearForm,

    calculateTotalAmount,
    calculateTaxAmount,
    validateForm,
    processPendingPaymentChanges,

    createInstallmentPayment,
    updateInstallmentPayment,
    deleteInstallmentPayment,
    addPaymentChange,
    clearChanges,
    getModifiedPayments,
  };
};
