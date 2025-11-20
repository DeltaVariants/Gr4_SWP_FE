/**
 * Auth Domain Entities
 * Định nghĩa các entity liên quan đến authentication
 */

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  // Convenience aliases (some UI components expect `name` or `username`)
  name?: string;
  username?: string;
  role: 'ADMIN' | 'STAFF' | 'EMPLOYEE' | 'CUSTOMER' | 'DRIVER';
  phoneNumber?: string;
  avatar?: string;
  stationId?: string;
  stationName?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  // Accept either `fullName` or `name` from different forms
  fullName?: string;
  name?: string;
  phoneNumber: string;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface VerifyEmailData {
  token: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface SendResetPasswordData {
  email: string;
}

