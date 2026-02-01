export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string | null;
  date: Date;
  paymentMethod: string | null;
  personInCharge: string | null;
  receiptImage: string | null;
  cashAccountId: string | null;
  cashTransactionId: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface DbExpense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string | null;
  date: string;
  payment_method: string | null;
  person_in_charge: string | null;
  receipt_image: string | null;
  cash_account_id: string | null;
  cash_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}
