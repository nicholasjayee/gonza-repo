
export interface NoticeTemplate {
  id: string;
  name: string;
  category: 'payment' | 'policy' | 'general' | 'announcement' | 'gratitude';
  subject: string;
  content: string;
}

export const noticeTemplates: NoticeTemplate[] = [
  {
    id: 'thank_you',
    name: 'Thank You for Purchase',
    category: 'gratitude',
    subject: 'Thank You for Your Purchase',
    content: 'Thank you for shopping with us. We truly appreciate your business and hope you enjoy your purchase.\n\nPlease let us know if you need any assistance.'
  },
  {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    category: 'payment',
    subject: 'Payment Reminder',
    content: 'This is a friendly reminder regarding the outstanding balance on your account. We kindly request you to settle the payment at your earliest convenience.'
  },
  {
    id: 'stock_arrival',
    name: 'New Stock Arrival',
    category: 'announcement',
    subject: 'New Items In Stock!',
    content: 'We are excited to inform you that we have received new stock of items you might be interested in. Come visit us to check out our latest collection!'
  },
  {
    id: 'holiday_hours',
    name: 'Holiday Hours',
    category: 'general',
    subject: 'Holiday Operating Hours',
    content: 'Please be advised that our operating hours will be changing for the upcoming holiday season. We will be open from [TIME] to [TIME].'
  }
];

export const getTemplateById = (id: string): NoticeTemplate | undefined => {
  return noticeTemplates.find(t => t.id === id);
};
