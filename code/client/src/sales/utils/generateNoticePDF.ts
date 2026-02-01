
import jsPDF from 'jspdf';
import { format } from 'date-fns';
// import { BusinessSettings } from '@/inventory/hooks/useBusinessSettings'; // Use partial type
// import { Customer } from '@/types'; // Use partial type

interface CustomerPartial {
  fullName: string;
  phoneNumber?: string | null;
  email?: string | null;
  location?: string | null;
}

interface NoticeData {
  customer: CustomerPartial;
  subject: string;
  content: string;
  senderName?: string;
}

export const generateNoticePDF = async (
  noticeData: NoticeData,
  businessSettings: any // Relaxed type for compatibility
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const addWatermark = () => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Created By Gonza Systems', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  try {
    doc.setFont('helvetica', 'normal');

    const checkPageBreak = (requiredSpace: number): void => {
      if (yPosition + requiredSpace > pageHeight - margin - 15) {
        addWatermark();
        doc.addPage();
        yPosition = margin;
      }
    };

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
      doc.setFontSize(fontSize);
      const splitText = doc.splitTextToSize(text, maxWidth);
      
      let currentY = y;
      
      splitText.forEach((line: string) => {
        checkPageBreak(6);
        doc.text(line, x, yPosition);
        yPosition += 5;
      });
      
      return yPosition;
    };

    // Business Header
    // const headerHeight = 25;
    if (businessSettings.businessLogo) {
      try {
        const img = new Image();
        img.src = businessSettings.businessLogo;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          if (img.complete) resolve(img);
        });
        
        const maxLogoWidth = 40;
        const maxLogoHeight = 20;
        const aspectRatio = img.width / img.height;
        let logoWidth = maxLogoWidth;
        let logoHeight = logoWidth / aspectRatio;
        if (logoHeight > maxLogoHeight) {
          logoHeight = maxLogoHeight;
          logoWidth = logoHeight * aspectRatio;
        }
        doc.addImage(businessSettings.businessLogo, 'JPEG', margin, yPosition, logoWidth, logoHeight);
      } catch (error) {
        console.error('Error adding business logo:', error);
      }
    }

    const rightMargin = pageWidth - margin;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(businessSettings.businessName || 'Business Name', rightMargin, yPosition + 5, { align: 'right' });
    yPosition += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (businessSettings.businessAddress) {
      const addressLines = doc.splitTextToSize(businessSettings.businessAddress, 80);
      addressLines.forEach((line: string, index: number) => {
         doc.text(line, rightMargin, yPosition + (index * 4), { align: 'right' });
      });
      yPosition += (addressLines.length * 4) - 4;
    }
    
    if (businessSettings.businessPhone) {
      yPosition += 4;
      doc.text(`Phone: ${businessSettings.businessPhone}`, rightMargin, yPosition, { align: 'right' });
    }
    
    if (businessSettings.businessEmail) {
      yPosition += 4;
      doc.text(`Email: ${businessSettings.businessEmail}`, rightMargin, yPosition, { align: 'right' });
    }

    yPosition += 8;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Date
    checkPageBreak(15);
    doc.setFontSize(11);
    const currentDate = format(new Date(), 'MMMM d, yyyy');
    doc.text(`Date: ${currentDate}`, margin, yPosition);
    yPosition += 12;

    // Customer Address Block
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.text(noticeData.customer.fullName || 'Valued Customer', margin, yPosition);
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    if (noticeData.customer.location) {
      yPosition = addWrappedText(noticeData.customer.location, margin, yPosition, pageWidth - 2 * margin, 11);
      yPosition += 2;
    }
    if (noticeData.customer.email) {
      checkPageBreak(8);
      doc.text(noticeData.customer.email, margin, yPosition);
      yPosition += 5;
    }
    yPosition += 8;

    // Subject
    if (noticeData.subject) {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      yPosition = addWrappedText(`Re: ${noticeData.subject}`, margin, yPosition, pageWidth - 2 * margin, 12);
      yPosition += 6;
    }

    // Body
    checkPageBreak(15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Dear ${noticeData.customer.fullName || 'Valued Customer'},`, margin, yPosition);
    yPosition += 8;

    if (noticeData.content) {
      const paragraphs = noticeData.content.split('\n\n').filter(p => p.trim() !== '');
      paragraphs.forEach((paragraph, index) => {
        const estimatedSpace = Math.ceil(paragraph.length / 80) * 5 + 10;
        checkPageBreak(estimatedSpace);
        yPosition = addWrappedText(paragraph.trim(), margin, yPosition, pageWidth - 2 * margin, 11);
        if (index < paragraphs.length - 1) {
          yPosition += 6;
        }
      });
      yPosition += 10;
    }

    // Closing
    checkPageBreak(60);
    doc.text('Yours faithfully,', margin, yPosition);
    yPosition += 20;

    // Signature
    if (businessSettings.signature) {
      try {
        const sigImg = new Image();
        sigImg.src = businessSettings.signature;
        await new Promise((resolve, reject) => {
           sigImg.onload = resolve;
           sigImg.onerror = reject;
           if (sigImg.complete) resolve(sigImg);
        });
        const maxSigWidth = 50;
        const sigAspectRatio = sigImg.width / sigImg.height;
        const signatureWidth = maxSigWidth;
        const signatureHeight = signatureWidth / sigAspectRatio;
        
        doc.addImage(businessSettings.signature, 'JPEG', margin, yPosition, signatureWidth, signatureHeight);
        yPosition += signatureHeight + 5;
      } catch (error) {
        console.error('Error adding signature:', error);
        yPosition += 15;
      }
    } else {
      yPosition += 15;
    }

    // Sender Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const senderName = noticeData.senderName || businessSettings.businessName || 'Management';
    doc.text(senderName, margin, yPosition);
    
    addWatermark();

    const customerName = noticeData.customer.fullName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Customer';
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `Notice_${customerName}_${dateStr}.pdf`;
    doc.save(filename);

  } catch (error) {
    console.error('Error generating notice PDF:', error);
    throw new Error('Failed to generate notice PDF');
  }
};
