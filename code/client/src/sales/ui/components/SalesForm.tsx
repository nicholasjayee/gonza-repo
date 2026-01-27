import React, { useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import SaleFormHeader from './sales-form/SaleFormHeader';
import SaleItemsManager from './sales-form/SaleItemsManager';
import SalePaymentSection from './sales-form/SalePaymentSection';
import SaleFormActions from './sales-form/SaleFormActions';
import { useSaleFormLogic } from '@/sales/hooks/useSaleFormLogic';
import { useCashAccounts } from '@/sales/hooks/useCashAccounts';
import { useCustomerCategories } from '@/shared/hooks/useCustomerCategories';
import { Customer } from '@/dashboard/types';

interface SalesFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { accounts: cashAccounts } = useCashAccounts();
  // Mock customers for now
  const customers: Customer[] = []; 
  
  const {
    formData,
    errors,
    taxRateInput,
    printAfterSave,
    includePaymentInfo,
    selectedCustomerCategoryId,
    paymentDate,
    linkToCash,
    selectedCashAccountId,
    payments,
    pendingChanges,
    hasChanges,

    setTaxRateInput,
    setPrintAfterSave,
    setIncludePaymentInfo,
    setLinkToCash,
    setSelectedCashAccountId,

    handleChange,
    handleSelectChange,
    handleAddItem,
    handleUpdateItem,
    handleRemoveItem,
    handleSelectCustomer,
    handleCategoryChange,
    handleSalesCategoryChange,
    handleAmountPaidChange,
    handlePaymentDateChange,
    clearForm,

    calculateTotalAmount,
    calculateTaxAmount,
    validateForm,

    createInstallmentPayment,
    updateInstallmentPayment,
    deleteInstallmentPayment,
    addPaymentChange,
    clearChanges,
    getModifiedPayments,
  } = useSaleFormLogic({
    initialData,
    defaultPaymentStatus: 'Paid',
    cashAccounts,
  });

  const totalAmount = calculateTotalAmount();
  const taxAmount = calculateTaxAmount();
  const grandTotal = totalAmount + taxAmount;
  const amountDue = grandTotal - (formData.amountPaid || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SaleFormHeader
        isEditing={!!initialData}
        selectedDate={paymentDate}
        onDateChange={handlePaymentDateChange}
        customerName={formData.customerName}
        customerAddress={formData.customerAddress}
        customerContact={formData.customerContact}
        notes={formData.notes}
        onCustomerInfoChange={handleChange}
        errors={errors}
        customers={customers}
        onAddNewCustomer={() => console.log('Add new customer')}
        onSelectCustomer={handleSelectCustomer}
        selectedCategoryId={selectedCustomerCategoryId}
        onCategoryChange={handleCategoryChange}
        onClearForm={clearForm}
      />

      <SaleItemsManager
        items={formData.items}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        taxRateInput={taxRateInput}
        onTaxRateChange={(e) => setTaxRateInput(e.target.value)}
        errors={errors}
        totalAmount={totalAmount}
        taxAmount={taxAmount}
        grandTotal={grandTotal}
        taxRate={formData.taxRate || 0}
        currency="UGX" // TODO: Get from settings
      />

      <SalePaymentSection
        paymentStatus={formData.paymentStatus}
        onPaymentStatusChange={handleSelectChange}
        isInstallmentSale={formData.paymentStatus === 'Installment Sale'}
        amountPaid={formData.amountPaid || 0}
        amountDue={amountDue}
        grandTotal={grandTotal}
        currency="UGX"
        onAmountPaidChange={handleAmountPaidChange}
        onPaymentDateChange={handlePaymentDateChange}
        paymentDate={paymentDate}
        saleId={initialData?.id}
        onPaymentStatusChangeFromInstallment={async () => {}}
        isEditing={!!initialData}
        payments={payments}
        pendingChanges={pendingChanges}
        onStagePaymentChange={addPaymentChange}
        linkToCash={linkToCash}
        onLinkToCashChange={setLinkToCash}
        selectedCashAccountId={selectedCashAccountId}
        onCashAccountChange={setSelectedCashAccountId}
        cashAccounts={cashAccounts}
        hasPaidWithHistory={false} // TODO: Implement check
        onLinkPaymentToCash={async () => {}}
        onUpdatePayment={async () => {}}
        notes={formData.notes}
        onNotesChange={handleChange as any}
        categoryId={formData.categoryId}
        onCategoryChange={handleSalesCategoryChange}
      />

      <SaleFormActions
        loading={false}
        isEditing={!!initialData}
        onCancel={onCancel || (() => {})}
        onClearForm={clearForm}
        printAfterSave={printAfterSave}
        onPrintAfterSaveChange={setPrintAfterSave}
        paymentStatus={formData.paymentStatus}
        includePaymentInfo={includePaymentInfo}
        onIncludePaymentInfoChange={setIncludePaymentInfo}
        hasPendingPaymentChanges={hasChanges}
      />
    </form>
  );
};

export default SalesForm;
