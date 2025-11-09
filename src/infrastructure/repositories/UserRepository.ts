/**
 * User Repository Implementation
 * Implements IUserRepository using API calls
 */

import { IUserRepository } from '@/domain/repositories/IUserRepository';
import {
  User,
  UserSubscription,
  UpdateUserData,
  UpdateUserRoleData,
} from '@/domain/entities/User';
import api from '@/lib/api';

export class UserRepository implements IUserRepository {
  private readonly basePath = '/users';

  async getAll(): Promise<User[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<User> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async updateRole(data: UpdateUserRoleData): Promise<User> {
    // API: PUT /api/users/role
    const response = await api.put(`${this.basePath}/role`, data);
    return response.data.data || response.data;
  }

  async getUserSubscriptions(userID: string): Promise<UserSubscription[]> {
    // API: GET /api/users/user-subscriptions (với query param hoặc path)
    const response = await api.get(`${this.basePath}/${userID}/subscriptions`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getActiveSubscription(userID: string): Promise<UserSubscription | null> {
    try {
      const subscriptions = await this.getUserSubscriptions(userID);
      const active = subscriptions.find((sub) => sub.status === 'Active');
      return active || null;
    } catch (error) {
      console.error('[UserRepository] Get active subscription failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
