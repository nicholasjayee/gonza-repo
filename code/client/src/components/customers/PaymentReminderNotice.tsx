"use client";


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Download, Link, Share, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { Customer } from '@/types';
import { Sale } from '@/types';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { generatePaymentReminderPDF } from '@/utils/generatePaymentReminderPDF';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface PaymentReminderNoticeProps {
  customer: Customer;
  unpaidSales: Sale[];
  totalAmountDue: number;
}

const PaymentReminderNotice: React.FC<PaymentReminderNoticeProps> = ({
  customer,
  unpaidSales,
  totalAmountDue
}) => {
  const { settings } = useBusinessSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [customMessage, setCustomMessage] = useState(
    'Our records show that you have pending payments for the following items purchased on credit. We kindly request you to complete payment at your earliest convenience.\n\nPlease reach out to us if you need any assistance or clarification.'
  );

  const formatCurrency = (value: number) => {
    return `${settings.currency} ${formatNumber(value)}`;
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePaymentReminderPDF(customer, unpaidSales, totalAmountDue, settings, customMessage);
      toast({
        title: "Success",
        description: "Payment reminder PDF downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = () => {
    // Create outstanding items breakdown
    const itemsBreakdown = unpaidItems.map(item => 
      `${item.receiptNumber} - ${item.description} (Qty: ${item.quantity}) - ${formatCurrency(item.total)}`
    ).join('\n');

    const reminderText = `Payment Reminder for ${customer.fullName}

Dear ${customer.fullName},

${customMessage}

Outstanding Items:
${itemsBreakdown}

Total Outstanding Balance: ${formatCurrency(totalAmountDue)}

Thank you for your continued support.

${settings.businessName}`;
    
    navigator.clipboard.writeText(reminderText);
    toast({
      title: "Copied",
      description: "Payment reminder text with items copied to clipboard"
    });
  };

  const handleShareWhatsApp = () => {
    // Create outstanding items breakdown for WhatsApp
    const itemsBreakdown = unpaidItems.map(item => 
      `${item.receiptNumber} - ${item.description} (Qty: ${item.quantity}) - ${formatCurrency(item.total)}`
    ).join('%0A');

    const reminderText = `Payment Reminder for ${customer.fullName}%0A%0ADear ${customer.fullName},%0A%0A${customMessage.replace(/\n/g, '%0A')}%0A%0AOutstanding Items:%0A${itemsBreakdown}%0A%0ATotal Outstanding Balance: ${formatCurrency(totalAmountDue)}%0A%0AThank you for your continued support.%0A%0A${settings.businessName}`;
    
    const whatsappUrl = `https://wa.me/${customer.phoneNumber?.replace(/\D/g, '')}?text=${reminderText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Calculate unpaid items from all unpaid sales
  const unpaidItems = unpaidSales.flatMap(sale => 
    sale.items.map(item => ({
      ...item,
      saleId: sale.id,
      receiptNumber: sale.receiptNumber,
      saleDate: sale.date,
      total: item.price * item.quantity
    }))
  );

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className={`${isMobile ? 'pb-3 px-4 pt-4' : 'pb-4'}`}>
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-orange-600`} />
            <CardTitle className={`text-orange-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Payment Reminder Notice
            </CardTitle>
            <div className="ml-2 px-2 py-1 bg-orange-200 rounded-md">
              <span className={`text-orange-800 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {formatCurrency(totalAmountDue)}
              </span>
            </div>
          </div>
          <div className={`flex ${isMobile ? 'flex-wrap' : ''} gap-2`}>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"} 
              onClick={handleDownloadPDF}
              className={isMobile ? "flex-1 min-w-[140px]" : ""}
            >
              <Download className="h-4 w-4 mr-1" />
              {isMobile ? "PDF" : "Download PDF"}
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"} 
              onClick={handleCopyLink}
              className={isMobile ? "flex-1 min-w-[120px]" : ""}
            >
              <Link className="h-4 w-4 mr-1" />
              {isMobile ? "Copy" : "Copy Text"}
            </Button>
            {customer.phoneNumber && (
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"} 
                onClick={handleShareWhatsApp}
                className={isMobile ? "flex-1 min-w-[140px]" : ""}
              >
                <Share className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            )}
            <Button 
              variant="ghost" 
              size={isMobile ? "sm" : "sm"} 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${isMobile ? "flex-1 min-w-[120px]" : ""} text-orange-700 hover:bg-orange-100`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  View Details
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className={isMobile ? "px-4 pb-4" : ""}>
          <div className="space-y-4">
            <div className={`bg-white ${isMobile ? 'p-3' : 'p-4'} rounded-lg border`}>
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-600 mb-3`}>
                <strong>Dear {customer.fullName},</strong>
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-message" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700`}>
                    Reminder Message
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingMessage(!isEditingMessage)}
                    className={`${isMobile ? 'h-7 px-2 text-xs' : 'h-8 px-3'}`}
                  >
                    <Edit3 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-3 w-3 mr-1'}`} />
                    {isEditingMessage ? 'Save' : 'Edit'}
                  </Button>
                </div>
                
                {isEditingMessage ? (
                  <Textarea
                    id="reminder-message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className={`${isMobile ? 'min-h-[120px] text-sm' : 'min-h-[100px] text-sm'}`}
                    placeholder="Enter your custom reminder message..."
                  />
                ) : (
                  <div className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-600 whitespace-pre-line bg-gray-50 ${isMobile ? 'p-3' : 'p-3'} rounded border`}>
                    {customMessage}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              {isMobile ? (
                // Mobile: Stack layout for better readability
                <div className="divide-y divide-gray-200">
                  <div className="bg-orange-100 px-3 py-2">
                    <h3 className="font-semibold text-orange-800 text-sm">Outstanding Items</h3>
                  </div>
                  {unpaidItems.map((item, index) => (
                    <div key={`${item.saleId}-${index}`} className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{item.description}</p>
                          <p className="text-xs text-gray-500">Invoice: {item.receiptNumber}</p>
                          <p className="text-xs text-gray-500">{format(item.saleDate, 'MMM d, yyyy')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(item.total)}</p>
                          <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-orange-50 px-3 py-3 border-t-2 border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-orange-800 text-sm">Total Outstanding:</span>
                      <span className="font-bold text-orange-800 text-lg">{formatCurrency(totalAmountDue)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Desktop: Table layout
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Sale Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidItems.map((item, index) => (
                      <TableRow key={`${item.saleId}-${index}`}>
                        <TableCell className="font-medium">{item.receiptNumber}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                        <TableCell>{format(item.saleDate, 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-orange-50 border-t-2 border-orange-200">
                      <TableCell colSpan={4} className="font-semibold text-orange-800">
                        Total Outstanding Balance:
                      </TableCell>
                      <TableCell colSpan={2} className="font-bold text-orange-800 text-lg">
                        {formatCurrency(totalAmountDue)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>

            <div className={`bg-white ${isMobile ? 'p-3' : 'p-4'} rounded-lg border`}>
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-600`}>
                <strong>Thank you for your continued support.</strong>
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mt-2`}>
                {settings.businessName}<br />
                Notice generated on {format(new Date(), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PaymentReminderNotice;
