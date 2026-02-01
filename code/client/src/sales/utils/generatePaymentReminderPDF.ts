
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '@/sales/types'; // Use local types
// import { BusinessSettings } from '@/inventory/hooks/useBusinessSettings'; // Assume compatible type structure
import { format } from 'date-fns';

// Define minimal types needed if not imported
interface CustomerPartial {
    fullName: string;
    phoneNumber?: string | null;
    email?: string | null;
    location?: string | null;
}

interface BusinessSettingsPartial {
    businessName: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    currency: string;
}

export const generatePaymentReminderPDF = async (
  customer: CustomerPartial,
  unpaidSales: Sale[],
  totalAmountDue: number,
  settings: any, // Typed as any to avoid strict dependency coupling for now, expected to match BusinessSettings
  customMessage?: string
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    const addWatermark = () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text('Created By Gonza Systems', pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT REMINDER NOTICE', pageWidth / 2, 30, { align: 'center' });

    // Business details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPos = 50;
    
    if (settings.businessName) doc.text(settings.businessName, margin, yPos);
    yPos += 6;
    if (settings.address) { // Map legacy 'businessAddress' to 'address' if needed
         doc.text(settings.address, margin, yPos);
         yPos += 6;
    }
    if (settings.phone) {
        doc.text(`Phone: ${settings.phone}`, margin, yPos);
        yPos += 6;
    }
    if (settings.email) {
        doc.text(`Email: ${settings.email}`, margin, yPos);
        yPos += 6;
    }
    yPos += 15;

    // Date
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
    yPos += 15;

    // Content
    doc.text(`Dear ${customer.fullName},`, margin, yPos);
    yPos += 8;

    const defaultMessage = 'Our records show that you have pending payments for the following items. We kindly request you to complete payment at your earliest convenience.';
    const reminderText = customMessage || defaultMessage;
    
    const splitText = doc.splitTextToSize(reminderText, pageWidth - 2 * margin);
    doc.text(splitText, margin, yPos);
    yPos += splitText.length * 6 + 10;

    // Table Data
    // Since we don't have separate installment chunks in schema, we show the Sale summary
    const tableBody = unpaidSales.map(sale => {
        const saleTotal = Number(sale.profit || 0); // Need to verify if 'profit' field holds the total or if we compute it. 
        // Using items reduce for accuracy as in legacy
        const calculatedTotal = sale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = calculatedTotal * ((sale.taxRate || 0) / 100);
        const finalTotal = calculatedTotal + tax;
        const paid = sale.amountPaid || 0;
        const due = sale.amountDue ?? (finalTotal - paid);

        return [
            sale.receiptNumber,
            format(new Date(sale.date), 'MMM d, yyyy'),
            `${settings.currency} ${paid.toLocaleString()}`,
            `${settings.currency} ${due.toLocaleString()}`,
            `${settings.currency} ${finalTotal.toLocaleString()}`
        ];
    });

    const tableHeaders = [['Receipt #', 'Date', 'Amount Paid', 'Balance Due', 'Total Amount']];

    autoTable(doc, {
        startY: yPos,
        head: tableHeaders,
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [255, 145, 77] },
        margin: { left: margin, right: margin }
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL OUTSTANDING: ${settings.currency} ${totalAmountDue.toLocaleString()}`, margin, finalY);

    addWatermark();
    
    const fileName = `Payment_Reminder_${customer.fullName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
