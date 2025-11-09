/**
 * User Domain Entity
 * Định nghĩa entity cho người dùng
 */

export interface User {
  userID: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'Admin' | 'Customer' | 'Employee';
  stationID?: string;
  stationName?: string;
  isActive: boolean;
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  userSubscriptionID: string;
  userID: string;
  subscriptionPlanID: string;
  subscriptionPlanName?: string;
  startDate: string;
  endDate: string;
  remainingSwaps: number;
  status: 'Active' | 'Expired' | 'Cancelled' | 'Suspended';
  autoRenew: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlan {
  subscriptionPlanID: string;
  planName: string;
  description?: string;
  price: number;
  duration: number; // days
  swapLimit: number;
  features?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserData {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  avatar?: string;
}

export interface UpdateUserRoleData {
  userID: string;
  role: User['role'];
  stationID?: string;
}
