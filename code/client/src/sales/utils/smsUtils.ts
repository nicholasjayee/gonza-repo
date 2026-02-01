import { isIOS } from '@/inventory/hooks/use-mobile'; // Assuming use-mobile has isIOS or similar, or I need to implement basic check

// Basic isIOS check if not available elsewhere
const isIOSDevice = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

export interface SMSOptions {
  phoneNumber: string;
  message: string;
}

export const formatPhoneForSMS = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  return cleaned;
};

export const formatMessageForSMS = (content: string, businessName?: string): string => {
  let sanitized = content.replace(/[\u00A0\u1680\u180e\u2000-\u2009\u200a\u200b\u202f\u205f\u3000]/g, ' ');
  let formatted = sanitized
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .substring(0, 800);

  if (businessName) {
    formatted += `\n\n- ${businessName}`;
  }
  return formatted;
};

export const canSendSMS = (customer: { phoneNumber?: string | null }): boolean => {
  return !!(customer.phoneNumber && customer.phoneNumber.trim());
};

export const openSMSApp = (options: SMSOptions): void => {
  const { phoneNumber, message } = options;
  const formattedPhone = formatPhoneForSMS(phoneNumber);
  const encodedMessage = encodeURIComponent(message);

  let smsUrl: string;
  if (isIOSDevice()) {
    smsUrl = `sms:${formattedPhone}&body=${encodedMessage}`; // iOS standard
  } else {
    smsUrl = `sms:${formattedPhone}?body=${encodedMessage}`; // Android standard
  }

  try {
    window.open(smsUrl, '_self');
  } catch (error) {
    console.error('Failed to open SMS app:', error);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(message).then(() => {
            alert('SMS app not available. Message copied to clipboard.');
        }).catch(() => {
            console.error('Clipboard access denied');
        });
    }
  }
};
