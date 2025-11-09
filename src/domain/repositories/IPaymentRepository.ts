/**
 * Payment Repository Interface
 * Định nghĩa contract cho payment operations
 */

import { Payment, CreatePaymentData, PayOSWebhookData } from '../entities/Payment';

export interface IPaymentRepository {
  /**
   * Get all payments
   */
  getAll(): Promise<Payment[]>;

  /**
   * Get payment by ID
   */
  getById(id: string): Promise<Payment>;

  /**
   * Get payments by user
   */
  getByUser(userID: string): Promise<Payment[]>;

  /**
   * Get payment by swap transaction
   */
  getBySwapTransaction(swapTransactionID: string): Promise<Payment | null>;

  /**
   * Create payment
   */
  create(data: CreatePaymentData): Promise<Payment>;

  /**
   * Update payment status
   */
  updateStatus(id: string, status: Payment['paymentStatus']): Promise<Payment>;

  /**
   * Create PayOS payment link
   */
  createPayOSPayment(data: {
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ paymentUrl: string; orderCode: string }>;

  /**
   * Handle PayOS webhook
   */
  handlePayOSWebhook(data: PayOSWebhookData): Promise<void>;
}
