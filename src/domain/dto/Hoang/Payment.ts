/**
 * Payment Domain Entity
 * Định nghĩa entity cho thanh toán
 */

export interface Payment {
  paymentID: string;
  swapTransactionID?: string;
  bookingID?: string;
  userID: string;
  userName?: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'E-Wallet' | 'PayOS' | 'Subscription';
  paymentStatus: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Refunded';
  transactionReference?: string;
  paymentDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentData {
  swapTransactionID?: string;
  bookingID?: string;
  userID: string;
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  transactionReference?: string;
  notes?: string;
}

export interface PayOSWebhookData {
  orderCode: string;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  virtualAccountNumber?: string;
}

