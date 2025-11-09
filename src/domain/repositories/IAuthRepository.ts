/**
 * Auth Repository Interface
 * Định nghĩa contract cho authentication operations
 */

import {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthTokens,
  VerifyEmailData,
  ResetPasswordData,
  SendResetPasswordData,
} from '../entities/Auth';

export interface IAuthRepository {
  /**
   * Login with credentials
   */
  login(credentials: LoginCredentials): Promise<AuthResponse>;

  /**
   * Register new user
   */
  register(data: RegisterData): Promise<AuthResponse>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;

  /**
   * Refresh access token
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<AuthUser>;

  /**
   * Verify email with token
   */
  verifyEmail(data: VerifyEmailData): Promise<void>;

  /**
   * Send password reset email
   */
  sendPasswordReset(data: SendResetPasswordData): Promise<void>;

  /**
   * Reset password with token
   */
  resetPassword(data: ResetPasswordData): Promise<void>;
}
