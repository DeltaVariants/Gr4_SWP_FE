/**
 * Calculate Swap Amount Use Case
 * Calculate amount based on subscription plan
 */

import { subscriptionRepository } from '@/infrastructure/repositories/SubscriptionRepository';

export interface CalculateSwapAmountInput {
  userId: string;
  subscriptionPlanId?: string;
}

export interface SwapAmountResult {
  amount: number;
  isFree: boolean;
  remainingSwaps: number;
  subscriptionPlanName?: string;
  reason: string;
}

export class CalculateSwapAmountUseCase {
  async execute(input: CalculateSwapAmountInput): Promise<SwapAmountResult> {
    try {
      // Get active subscription
      const userSubscriptions = await subscriptionRepository.getAllUserSubscriptions();
      const activeSubscription = userSubscriptions.find(
        (sub) => sub.userID === input.userId && sub.status === 'Active'
      );

      if (activeSubscription && activeSubscription.remainingSwaps > 0) {
        // User has active subscription with remaining swaps
        const plan = await subscriptionRepository.getPlanById(
          activeSubscription.subscriptionPlanID
        );

        return {
          amount: 0,
          isFree: true,
          remainingSwaps: activeSubscription.remainingSwaps,
          subscriptionPlanName: plan.planName,
          reason: `Sử dụng gói ${plan.planName} (còn ${activeSubscription.remainingSwaps} lần đổi)`,
        };
      }

      // No active subscription - pay per swap
      // Default price (should be configurable)
      const defaultSwapPrice = 50000; // 50,000 VND

      return {
        amount: defaultSwapPrice,
        isFree: false,
        remainingSwaps: 0,
        reason: 'Thanh toán theo lượt đổi',
      };
    } catch (error: any) {
      console.error('[CalculateSwapAmountUseCase] ❌ Error:', error);
      // Return default price on error
      return {
        amount: 50000,
        isFree: false,
        remainingSwaps: 0,
        reason: 'Thanh toán theo lượt đổi (mặc định)',
      };
    }
  }
}

export const calculateSwapAmountUseCase = new CalculateSwapAmountUseCase();
