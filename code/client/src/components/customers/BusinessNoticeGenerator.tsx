"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Wand2, Download, AlertCircle, MessageSquare } from 'lucide-react';
import { Customer, Sale } from '@/types';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useToast } from '@/hooks/use-toast';
import { generateNoticePDF } from '@/utils/generateNoticePDF';
import { enhanceForBusiness } from '@/utils/formalizeText';
import { NoticeTemplate, getTemplateById } from '@/utils/noticeTemplates';
import { openSMSApp, formatMessageForSMS, canSendSMS } from '@/utils/smsUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import NoticeTemplateSelector from './NoticeTemplateSelector';

interface BusinessNoticeGeneratorProps {
  customer: Customer;
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
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
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
        
        // If it's a thank you template and we have sale data, enhance the content
        if (defaultTemplate === 'thank_you' && sale) {
          const saleTotal = sale.items.reduce((total, item) => {
            const itemSubtotal = item.price * item.quantity;
            const discountAmount = item.discountType === 'amount' 
              ? (item.discountAmount || 0)
              : (itemSubtotal * (item.discountPercentage || 0)) / 100;
            return total + (itemSubtotal - discountAmount);
          }, 0);
          
          // Add tax if applicable
          const taxAmount = saleTotal * ((sale.taxRate || 0) / 100);
          const totalWithTax = saleTotal + taxAmount;
          
          // Create items list
          const itemsList = sale.items.map(item => 
            `• ${item.description} (Qty: ${item.quantity})`
          ).join('\n');
          
          const enhancedContent = `${template.content}

Receipt Number: ${sale.receiptNumber}

Items Purchased:
${itemsList}

Total Amount: ${settings.currency} ${totalWithTax.toFixed(2)}

In case of any inquiries please call ${settings.businessPhone && settings.businessPhone !== '(123) 456-7890' ? settings.businessPhone : 'our office'}.

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
    if (!message.trim() || message === 'Write your message here...' || message === 'Write your specific message here...') {
      toast({
        title: "No message to enhance",
        description: "Please enter your message first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const enhanced = enhanceForBusiness(message);
      setMessage(enhanced);
      
      toast({
        title: "Message enhanced!",
        description: "Your message has been made more formal and professional.",
      });
    } catch (error) {
      console.error('Error enhancing message:', error);
      toast({
        title: "Enhancement failed",
        description: "Could not enhance the message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (!message.trim() || message === 'Write your message here...' || message === 'Write your specific message here...') {
      toast({
        title: "Message required",
        description: "Please enter a message before generating the notice.",
        variant: "destructive"
      });
      return;
    }

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

      toast({
        title: "Notice generated successfully!",
        description: "Your professional business notice has been downloaded as a PDF.",
      });

      // Reset form after successful generation
      setMessage('');
      setSubject('');
      setSelectedTemplate('none');
      setSenderName('');
      onClose();

    } catch (error) {
      console.error('Error generating notice:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate the notice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setSubject('');
    setSelectedTemplate('none');
    setSenderName('');
    setShowPreview(false);
    onClose();
  };

  const handleSendSMS = () => {
    if (!message.trim() || message === 'Write your message here...' || message === 'Write your specific message here...') {
      toast({
        title: "Message required",
        description: "Please enter a message before sending SMS.",
        variant: "destructive"
      });
      return;
    }

    if (!canSendSMS(customer)) {
      toast({
        title: "Phone number required",
        description: "Customer phone number is not available.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format the message for SMS
      const fullMessage = `${subject ? subject + '\n\n' : ''}Dear ${customer.fullName},\n\n${message}\n\nYours faithfully,\n${senderName || settings.businessName || 'Management'}`;
      
      const formattedMessage = formatMessageForSMS(fullMessage, settings.businessName);
      
      openSMSApp({
        phoneNumber: customer.phoneNumber!,
        message: formattedMessage
      });

      toast({
        title: "SMS app opened",
        description: "Your message has been prepared in the SMS app.",
      });

    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "SMS failed",
        description: "Failed to open SMS app. Please try again.",
        variant: "destructive"
      });
    }
  };

  const showSMSOption = isMobile && canSendSMS(customer);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Send Notice to {customer.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compose Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Compose Your Notice</h3>
              
              {/* Template Selector */}
              <NoticeTemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                onTemplateSelect={handleTemplateSelect}
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter the subject of your notice"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">Your Message</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMakeFormal}
                  className="text-xs"
                  disabled={!message.trim() || message === 'Write your message here...' || message === 'Write your specific message here...'}
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Make it Formal
                </Button>
              </div>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What do you want to inform the customer about?"
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {selectedTemplate !== 'none' ? 'Template content loaded. Edit as needed.' : 'Write in your own words - we\'ll format it professionally.'}
              </p>
            </div>

            {/* Sender Name */}
            <div className="space-y-2">
              <Label htmlFor="sender">Sender Name (Optional)</Label>
              <Input
                id="sender"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name (defaults to business name)"
              />
            </div>

            {/* Business Settings Alert */}
            {(!settings.businessLogo || !settings.signature) && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="text-amber-800 font-medium">Enhance your notices</p>
                      <p className="text-amber-700">
                        {!settings.businessLogo && 'Add your business logo '}
                        {(!settings.businessLogo && !settings.signature) && 'and '}
                        {!settings.signature && 'upload your signature '}
                        in Business Settings for more professional notices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {showPreview && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    {/* Header */}
                    <div className="border-b pb-3">
                      <div className="font-bold text-lg">{settings.businessName || 'Your Business'}</div>
                      <div className="text-gray-600">
                        {settings.businessAddress && <div>{settings.businessAddress}</div>}
                        {settings.businessPhone && <div>Phone: {settings.businessPhone}</div>}
                        {settings.businessEmail && <div>Email: {settings.businessEmail}</div>}
                      </div>
                    </div>

                    {/* Date and Customer */}
                    <div>
                      <div>Date: {new Date().toLocaleDateString()}</div>
                      <div className="mt-2 font-medium">{customer.fullName}</div>
                      {customer.location && <div className="text-gray-600">{customer.location}</div>}
                    </div>

                    {/* Subject */}
                    {subject && (
                      <div>
                        <strong>Re: {subject}</strong>
                      </div>
                    )}

                    {/* Content */}
                    <div className="space-y-2">
                      <div>Dear {customer.fullName},</div>
                      <div className="whitespace-pre-wrap">
                        {message || 'Your message will appear here...'}
                      </div>
                      <div>Yours faithfully,</div>
                      <div className="mt-4 font-medium">
                        {senderName || settings.businessName || 'Management'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {showSMSOption && (
            <Button 
              variant="outline"
              onClick={handleSendSMS}
              disabled={!message.trim() || message === 'Write your message here...' || message === 'Write your specific message here...'}
              className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <MessageSquare className="h-4 w-4" />
              Send SMS
            </Button>
          )}
          <Button 
            onClick={handleGeneratePDF}
            disabled={!message.trim() || message === 'Write your message here...' || message === 'Write your specific message here...' || isGenerating}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessNoticeGenerator;
