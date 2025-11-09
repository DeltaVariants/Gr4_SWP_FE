/**
 * Get Customer Details Use Case
 * Get customer info including subscription for verification
 */

import { userRepository } from '@/infrastructure/repositories/UserRepository';
import { vehicleRepository } from '@/infrastructure/repositories/VehicleRepository';
import { subscriptionRepository } from '@/infrastructure/repositories/SubscriptionRepository';
import { User, UserSubscription } from '@/domain/entities/User';
import { Vehicle } from '@/domain/entities/Vehicle';

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
