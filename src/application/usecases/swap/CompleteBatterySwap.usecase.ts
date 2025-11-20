/**
 * Complete Battery Swap Use Case
 * Complete the battery swap transaction
 */

import { swapTransactionRepository } from '@/infrastructure/repositories/Hoang/SwapTransactionRepository';
import { bookingRepository } from '@/infrastructure/repositories/Hoang/BookingRepository';
import { batteryRepository } from '@/infrastructure/repositories/Hoang/BatteryRepository';
import { subscriptionRepository } from '@/infrastructure/repositories/Hoang/SubscriptionRepository';
import { SwapTransaction } from '@/domain/dto/Hoang/SwapTransaction';

export interface CompleteBatterySwapInput {
  bookingId: string;
  userId: string;
  vehicleId: string;
  stationId: string;
  oldBatteryId: string;
  newBatteryId: string;
  amount: number;
  paymentStatus: 'Paid' | 'Failed';
  subscriptionPlanId?: string;
  notes?: string;
}

export class CompleteBatterySwapUseCase {
  async execute(input: CompleteBatterySwapInput): Promise<SwapTransaction> {
    try {
      // 1. Create swap transaction
      const swapTransaction = await swapTransactionRepository.create({
        userID: input.userId,
        vehicleID: input.vehicleId,
        stationID: input.stationId,
        bookingID: input.bookingId,
        oldBatteryID: input.oldBatteryId,
        newBatteryID: input.newBatteryId,
        amount: input.amount,
        subscriptionPlanID: input.subscriptionPlanId,
        notes: input.notes,
      });

      // 2. Complete swap transaction
      const completedSwap = await swapTransactionRepository.complete(
        swapTransaction.swapTransactionID,
        {
          oldBatteryID: input.oldBatteryId,
          newBatteryID: input.newBatteryId,
          amount: input.amount,
          paymentStatus: input.paymentStatus,
          notes: input.notes,
        }
      );

      // 3. Update booking status to Completed
      await bookingRepository.updateStatus(input.bookingId, 'Completed');

      // 4. Update battery statuses
      await Promise.all([
        batteryRepository.updateStatus({
          batteryId: input.oldBatteryId,
          status: 'Charging',
          notes: `Returned from swap ${completedSwap.swapTransactionID}`,
        }),
        batteryRepository.updateStatus({
          batteryId: input.newBatteryId,
          status: 'In-Use',
          notes: `Swapped in transaction ${completedSwap.swapTransactionID}`,
        }),
      ]);

      // 5. Update subscription remaining swaps if applicable
      if (input.subscriptionPlanId && input.amount === 0) {
        try {
          const userSubscriptions = await subscriptionRepository.getAllUserSubscriptions();
          const activeSubscription = userSubscriptions.find(
            (sub) =>
              sub.userID === input.userId &&
              sub.subscriptionPlanID === input.subscriptionPlanId &&
              sub.status === 'Active'
          );

          if (activeSubscription && activeSubscription.remainingSwaps > 0) {
            await subscriptionRepository.updateUserSubscription(
              activeSubscription.userSubscriptionID,
              {
                remainingSwaps: activeSubscription.remainingSwaps - 1,
              }
            );
          }
        } catch (error) {
          console.warn('[CompleteBatterySwapUseCase] Failed to update subscription:', error);
          // Don't fail the entire transaction if subscription update fails
        }
      }

      console.log('[CompleteBatterySwapUseCase] ✅ Swap completed:', completedSwap);

      return completedSwap;
    } catch (error: any) {
      console.error('[CompleteBatterySwapUseCase] ❌ Error:', error);
      throw new Error(error.message || 'Không thể hoàn thành đổi pin');
    }
  }
}

export const completeBatterySwapUseCase = new CompleteBatterySwapUseCase();
