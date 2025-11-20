/**
 * Subscription Repository Implementation
 * Implements ISubscriptionRepository using API calls
 */

import { ISubscriptionRepository } from '@/domain/repositories/Hoang/IUserRepository';
import {
  SubscriptionPlan,
  UserSubscription,
} from '@/domain/dto/Hoang/User';
import api from '@/lib/api';

export class SubscriptionRepository implements ISubscriptionRepository {
  private readonly plansPath = '/subscription-plans';
  private readonly userSubsPath = '/user-subscriptions';

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get(this.plansPath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const response = await api.get(`${this.plansPath}/${id}`);
    return response.data.data || response.data;
  }

  async getUserSubscriptionById(id: string): Promise<UserSubscription> {
    const response = await api.get(`${this.userSubsPath}/${id}`);
    return response.data.data || response.data;
  }

  async updateUserSubscription(
    id: string,
    data: Partial<UserSubscription>
  ): Promise<UserSubscription> {
    const response = await api.put(`${this.userSubsPath}/${id}`, data);
    return response.data.data || response.data;
  }

  async deleteUserSubscription(id: string): Promise<void> {
    await api.delete(`${this.userSubsPath}/${id}`);
  }

  async getAllUserSubscriptions(): Promise<UserSubscription[]> {
    const response = await api.get(this.userSubsPath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }
}

// Export singleton instance
export const subscriptionRepository = new SubscriptionRepository();

