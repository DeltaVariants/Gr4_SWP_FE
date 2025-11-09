/**
 * User Repository Interface
 * Định nghĩa contract cho user operations
 */

import {
  User,
  UserSubscription,
  SubscriptionPlan,
  UpdateUserData,
  UpdateUserRoleData,
} from '../entities/User';

export interface IUserRepository {
  /**
   * Get all users
   */
  getAll(): Promise<User[]>;

  /**
   * Get user by ID
   */
  getById(id: string): Promise<User>;

  /**
   * Update user
   */
  update(id: string, data: UpdateUserData): Promise<User>;

  /**
   * Delete user
   */
  delete(id: string): Promise<void>;

  /**
   * Update user role
   */
  updateRole(data: UpdateUserRoleData): Promise<User>;

  /**
   * Get user subscriptions
   */
  getUserSubscriptions(userID: string): Promise<UserSubscription[]>;

  /**
   * Get active user subscription
   */
  getActiveSubscription(userID: string): Promise<UserSubscription | null>;
}

export interface ISubscriptionRepository {
  /**
   * Get all subscription plans
   */
  getAllPlans(): Promise<SubscriptionPlan[]>;

  /**
   * Get subscription plan by ID
   */
  getPlanById(id: string): Promise<SubscriptionPlan>;

  /**
   * Get user subscription by ID
   */
  getUserSubscriptionById(id: string): Promise<UserSubscription>;

  /**
   * Update user subscription
   */
  updateUserSubscription(
    id: string,
    data: Partial<UserSubscription>
  ): Promise<UserSubscription>;

  /**
   * Delete user subscription
   */
  deleteUserSubscription(id: string): Promise<void>;

  /**
   * Get all user subscriptions
   */
  getAllUserSubscriptions(): Promise<UserSubscription[]>;
}
