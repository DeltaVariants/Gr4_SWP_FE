/**
 * Get Customer Details Use Case
 * Get customer info including subscription for verification
 */

import { userRepository } from '@/infrastructure/repositories/Hoang/UserRepository';
import { vehicleRepository } from '@/infrastructure/repositories/Hoang/VehicleRepository';
import { subscriptionRepository } from '@/infrastructure/repositories/Hoang/SubscriptionRepository';
import { User, UserSubscription } from '@/domain/dto/Hoang/User';
import { Vehicle } from '@/domain/dto/Hoang/Vehicle';

export interface CustomerDetails {
  user: User;
  vehicles: Vehicle[];
  activeSubscription: UserSubscription | null;
}

export class GetCustomerDetailsUseCase {
  async execute(userId: string): Promise<CustomerDetails> {
    try {
      // Fetch user, vehicles, and subscription in parallel
      const [user, vehicles, activeSubscription] = await Promise.all([
        userRepository.getById(userId),
        vehicleRepository.getByUser(userId),
        userRepository.getActiveSubscription(userId),
      ]);

      const customerDetails: CustomerDetails = {
        user,
        vehicles,
        activeSubscription,
      };

      console.log('[GetCustomerDetailsUseCase] ✅ Customer details:', customerDetails);

      return customerDetails;
    } catch (error: any) {
      console.error('[GetCustomerDetailsUseCase] ❌ Error:', error);
      throw new Error(error.message || 'Không thể lấy thông tin khách hàng');
    }
  }
}

export const getCustomerDetailsUseCase = new GetCustomerDetailsUseCase();
