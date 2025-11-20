/**
 * Process Swap Payment Use Case
 * Process payment for battery swap
 */

import { paymentRepository } from '@/infrastructure/repositories/Hoang/PaymentRepository';
import { Payment } from '@/domain/dto/Hoang/Payment';

export interface ProcessPaymentInput {
  userId: string;
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  bookingId?: string;
  swapTransactionId?: string;
  notes?: string;
}

export class ProcessSwapPaymentUseCase {
  async execute(input: ProcessPaymentInput): Promise<Payment> {
    try {
      // Create payment record
      const payment = await paymentRepository.create({
        userID: input.userId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        bookingID: input.bookingId,
        swapTransactionID: input.swapTransactionId,
        notes: input.notes,
      });

      // If amount is 0 (subscription), mark as completed immediately
      if (input.amount === 0) {
        const completedPayment = await paymentRepository.updateStatus(
          payment.paymentID,
          'Completed'
        );
        console.log('[ProcessSwapPaymentUseCase] ✅ Free payment completed:', completedPayment);
        return completedPayment;
      }

      // For Cash payment, mark as completed
      if (input.paymentMethod === 'Cash') {
        const completedPayment = await paymentRepository.updateStatus(
          payment.paymentID,
          'Completed'
        );
        console.log('[ProcessSwapPaymentUseCase] ✅ Cash payment completed:', completedPayment);
        return completedPayment;
      }

      // For other methods, return pending payment
      console.log('[ProcessSwapPaymentUseCase] ✅ Payment created:', payment);
      return payment;
    } catch (error: any) {
      console.error('[ProcessSwapPaymentUseCase] ❌ Error:', error);
      throw new Error(error.message || 'Không thể xử lý thanh toán');
    }
  }
}

export const processSwapPaymentUseCase = new ProcessSwapPaymentUseCase();
