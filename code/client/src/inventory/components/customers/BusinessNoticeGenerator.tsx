"use client";


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/inventory/components/ui/dialog';
import { Button } from '@/inventory/components/ui/button';
import { Textarea } from '@/inventory/components/ui/textarea';
import { Input } from '@/inventory/components/ui/input';
import { Label } from '@/inventory/components/ui/label';
import { Card, CardContent } from '@/inventory/components/ui/card';
import { FileText, Wand2, Download, MessageSquare } from 'lucide-react';
import { useBusinessSettings } from '@/inventory/hooks/useBusinessSettings';
import { useToast } from '@/inventory/hooks/use-toast';
import { generateNoticePDF } from '@/sales/utils/generateNoticePDF';
import { enhanceForBusiness } from '@/sales/utils/formalizeText';
import { NoticeTemplate, getTemplateById } from '@/sales/utils/noticeTemplates';
import { openSMSApp, formatMessageForSMS, canSendSMS } from '@/sales/utils/smsUtils';
import { useIsMobile } from '@/inventory/hooks/use-mobile';
import NoticeTemplateSelector from './NoticeTemplateSelector';
import { Sale } from '@/sales/types';

interface BusinessNoticeGeneratorProps {
  customer: {
    fullName: string;
    phoneNumber?: string | null;
    email?: string | null;
    location?: string | null;
  };
  open: boolean;
  onClose: () => void;
  defaultTemplate?: string;
  sale?: Sale;
}

const BusinessNoticeGenerator: React.FC<BusinessNoticeGeneratorProps> = ({
  customer,
  open,
  onClose,
  defaultTemplate,
  sale
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // const [showPreview, setShowPreview] = useState<boolean>(false); // Unused for now
  
  const { settings } = useBusinessSettings();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Load default template when dialog opens
  useEffect(() => {
    if (open && defaultTemplate) {
      const template = getTemplateById(defaultTemplate);
      if (template) {
        setSelectedTemplate(defaultTemplate);
        setSubject(template.subject);
        
        if (defaultTemplate === 'thank_you' && sale) {
          const saleTotal = sale.items.reduce((total, item) => total + (item.price * item.quantity), 0);
          const taxAmount = saleTotal * ((sale.taxRate || 0) / 100);
          const totalWithTax = saleTotal + taxAmount;
          
          const itemsList = sale.items.map(item => 
            `• ${item.description} (Qty: ${item.quantity})`
          ).join('\n');
          
          const enhancedContent = `${template.content}

Receipt Number: ${sale.receiptNumber}

Items Purchased:
${itemsList}

Total Amount: ${settings.currency} ${totalWithTax.toLocaleString()}

In case of any inquiries please call ${settings.businessPhone || 'our office'}.

We appreciate your business and look forward to serving you again.`;
          
          setMessage(enhancedContent);
        } else {
          setMessage(template.content);
        }
      }
    }
  }, [open, defaultTemplate, sale, settings.currency, settings.businessPhone]);

  const handleTemplateSelect = (template: NoticeTemplate) => {
    setSubject(template.subject);
    setMessage(template.content);
  };

  const handleMakeFormal = () => {
    if (!message.trim()) return;
    const enhanced = enhanceForBusiness(message);
    setMessage(enhanced);
  };

  const handleGeneratePDF = async () => {
    if (!message.trim()) return;
    setIsGenerating(true);
    try {
      await generateNoticePDF(
        {
          customer,
          subject: subject || 'Business Notice',
          content: message,
          senderName: senderName || undefined
        },
        settings
      );
      toast({ title: "Success", description: "Notice PDF generated." });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendSMS = () => {
    if (!message.trim() || !canSendSMS(customer)) return;
    const fullMessage = `${subject ? subject + '\n\n' : ''}Dear ${customer.fullName},\n\n${message}\n\nYours faithfully,\n${senderName || settings.businessName || 'Management'}`;
    const formattedMessage = formatMessageForSMS(fullMessage, settings.businessName || '');
    openSMSApp({ phoneNumber: customer.phoneNumber!, message: formattedMessage });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Send Notice to {customer.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Compose</h3>
                 <NoticeTemplateSelector
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    onTemplateSelect={handleTemplateSelect}
                  />
             </div>
             <div className="space-y-2">
               <Label>Subject</Label>
               <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
             </div>
             <div className="space-y-2">
               <div className="flex justify-between">
                  <Label>Message</Label>
                  <Button variant="ghost" size="sm" onClick={handleMakeFormal}><Wand2 className="h-3 w-3 mr-1"/> Formalize</Button>
               </div>
               <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} />
             </div>
             <div className="space-y-2">
               <Label>Sender Name</Label>
               <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Optional" />
             </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <Card className="border-gray-200">
                <CardContent className="p-4 text-sm space-y-3">
                    <div className="border-b pb-2 font-bold">{settings.businessName}</div>
                    <div>Date: {new Date().toLocaleDateString()}</div>
                    <div>Dear {customer.fullName},</div>
                    <div className="whitespace-pre-wrap">{message || '...'}</div>
                    <div className="mt-4 font-medium">{senderName || settings.businessName || 'Management'}</div>
                </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {isMobile && canSendSMS(customer) && (
                <Button variant="outline" onClick={handleSendSMS}><MessageSquare className="h-4 w-4 mr-2"/> SMS</Button>
            )}
            <Button onClick={handleGeneratePDF} disabled={isGenerating}>
                <Download className="h-4 w-4 mr-2"/> {isGenerating ? 'Generating...' : 'Generate PDF'}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessNoticeGenerator;
