
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, Sale, BusinessSettings } from '@/inventory/types/index';
import { format } from 'date-fns';
import { formatNumber } from '@/lib/utils';

export const generatePaymentReminderPDF = async (
  customer: Customer,
  unpaidSales: Sale[],
  totalAmountDue: number,
  settings: BusinessSettings,
  customMessage?: string
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Function to add watermark to current page
    const addWatermark = () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150); // Light gray color
      doc.text('Created By Gonza Systems', pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset to black
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT REMINDER NOTICE', pageWidth / 2, 30, { align: 'center' });

    // Business details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPos = 50;
    
    doc.text(settings.businessName, margin, yPos);
    yPos += 6;
    doc.text(settings.businessAddress, margin, yPos);
    yPos += 6;
    doc.text(`Phone: ${settings.businessPhone}`, margin, yPos);
    yPos += 6;
    doc.text(`Email: ${settings.businessEmail}`, margin, yPos);
    yPos += 15;

    // Date and customer info
    doc.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth - margin - 60, 50, { align: 'left' });
    
    doc.setFont('helvetica', 'bold');
    doc.text('TO:', margin, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(customer.fullName, margin, yPos);
    yPos += 6;
    
    if (customer.phoneNumber) {
      doc.text(`Phone: ${customer.phoneNumber}`, margin, yPos);
      yPos += 6;
    }
    
    if (customer.email) {
      doc.text(`Email: ${customer.email}`, margin, yPos);
      yPos += 6;
    }
    
    if (customer.location) {
      doc.text(`Address: ${customer.location}`, margin, yPos);
      yPos += 6;
    }
    
    yPos += 15;

    // Reminder message
    doc.setFont('helvetica', 'normal');
    doc.text(`Dear ${customer.fullName},`, margin, yPos);
    yPos += 8;
    
    // Use custom message if provided, otherwise use default based on sale type
    const hasInstallmentSales = unpaidSales.some(sale => sale.paymentStatus === 'Installment Sale');
    const defaultMessage = hasInstallmentSales 
      ? 'Our records show that you have outstanding installment payments for the items purchased. We kindly request you to complete the remaining payments according to your payment schedule.\n\nPlease reach out to us if you need any assistance or clarification regarding your installment plan.'
      : 'Our records show that you have pending payments for the following items purchased on credit. We kindly request you to complete payment at your earliest convenience.\n\nPlease reach out to us if you need any assistance or clarification.';
    
    const reminderText = customMessage || defaultMessage;
    
    const splitText = doc.splitTextToSize(reminderText, pageWidth - 2 * margin);
    doc.text(splitText, margin, yPos);
    yPos += splitText.length * 6 + 10;

    // Separate regular unpaid sales and installment sales
    const regularUnpaidSales = unpaidSales.filter(sale => sale.paymentStatus !== 'Installment Sale');
    const installmentSales = unpaidSales.filter(sale => sale.paymentStatus === 'Installment Sale');

    // Determine table headers based on sale types
    const hasInstallmentSalesWithDue = installmentSales.length > 0;
    const tableHeaders = hasInstallmentSalesWithDue 
      ? ['Invoice #', 'Product Name', 'Qty', 'Paid Amount', 'Outstanding', 'Sale Date', 'Total Sale']
      : ['Invoice #', 'Product Name', 'Qty', 'Price', 'Total', 'Sale Date', 'Sale Total'];

    // Prepare table data - start with regular unpaid sales
    const unpaidItems = regularUnpaidSales.flatMap(sale => {
      const saleTotal = sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      const taxAmount = saleTotal * ((sale.taxRate || 0) / 100);
      const totalWithTax = saleTotal + taxAmount;
      
      return sale.items.map(item => [
        sale.receiptNumber,
        item.description,
        item.quantity.toString(),
        `${settings.currency} ${formatNumber(item.price)}`,
        `${settings.currency} ${formatNumber(item.price * item.quantity)}`,
        format(new Date(sale.date), 'MMM d, yyyy'),
        `${settings.currency} ${formatNumber(totalWithTax)}`
      ]);
    });

    // Add installment sales with their outstanding balances
    // Since we don't have individual payment history in current schema, we use sale summary fields.
    const installmentItems = installmentSales.map(sale => {
      const saleTotal = sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      const taxAmount = saleTotal * ((sale.taxRate || 0) / 100);
      const totalWithTax = saleTotal + taxAmount;
      const totalPaid = sale.amountPaid || 0;
      const outstandingBalance = sale.amountDue || (totalWithTax - totalPaid);
      
      if (outstandingBalance > 0) {
        const mainItem = sale.items[0]; // Use first item as representative
        const itemsDescription = sale.items.length > 1 
          ? `${mainItem.description} (+${sale.items.length - 1} more items)`
          : mainItem.description;
          
        return [
          sale.receiptNumber,
          itemsDescription + ' (Installment)',
          sale.items.reduce((sum, item) => sum + item.quantity, 0).toString(),
          `${settings.currency} ${formatNumber(totalPaid)}`,
          `${settings.currency} ${formatNumber(outstandingBalance)}`,
          format(new Date(sale.date), 'MMM d, yyyy'),
          `${settings.currency} ${formatNumber(totalWithTax)}`
        ];
      }
      return [];
    }).filter(item => item.length > 0);

    // Combine all items
    const allItems = [...unpaidItems, ...installmentItems];

    // Calculate outstanding balance 
    const regularOutstanding = regularUnpaidSales.reduce((sum, sale) => {
      const saleTotal = sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      const taxAmount = saleTotal * ((sale.taxRate || 0) / 100);
      const total = saleTotal + taxAmount;
      const paid = sale.amountPaid || 0;
      return sum + (total - paid); // Use actual outstanding
    }, 0);

    const installmentOutstanding = installmentSales.reduce((sum, sale) => {
       const saleTotal = sale.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
       const taxAmount = saleTotal * ((sale.taxRate || 0) / 100);
       const totalWithTax = saleTotal + taxAmount;
       const paid = sale.amountPaid || 0;
       return sum + (sale.amountDue || (totalWithTax - paid));
    }, 0);
    
    const correctedOutstandingBalance = regularOutstanding + installmentOutstanding;

    // Add total row
    allItems.push([
      '', '', '', '', 'TOTAL OUTSTANDING:', `${settings.currency} ${formatNumber(correctedOutstandingBalance)}`, ''
    ]);

    // Create table using autoTable
    autoTable(doc, {
      startY: yPos,
      head: [tableHeaders],
      body: allItems,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 145, 77], // Orange color
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: function(data: any) {
        // Style the total row
        if (data.row.index === allItems.length - 1) {
          data.cell.styles.fillColor = [255, 200, 150];
          data.cell.styles.fontStyle = 'bold';
        }
        
        // Style payment status rows
        if (data.cell.text && data.cell.text[0] && data.cell.text[0].includes('Payment Status:')) {
          data.cell.styles.fillColor = [230, 230, 255]; // Light blue background
          data.cell.styles.fontStyle = 'italic';
          data.cell.styles.fontSize = 9;
        }
      },
      margin: { left: margin, right: margin }
    });

    // Footer message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your continued support.', margin, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${settings.businessName} - Payment Reminder`, margin, finalY + 15);

    // Add watermark to the final page
    addWatermark();

    // Save the PDF
    const fileName = `Payment_Reminder_${customer.fullName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating payment reminder PDF:', error);
    throw new Error('Failed to generate payment reminder PDF');
  }
};
