import { getNextReceiptNumberAction } from '@/app/sales/actions';

export const generateReceiptNumber = async (): Promise<string> => {
  try {
    const result = await getNextReceiptNumberAction();
    if (result.success && result.data) {
      return result.data;
    }
    return '000001';
  } catch (error) {
    console.error('Error generating receipt number:', error);
    return '000001';
  }
};
