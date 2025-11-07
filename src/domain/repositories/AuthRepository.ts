/**
 * Domain Repository Interface: Authentication
 * Clean Architecture - Domain Layer
 */

import {
  LoginCredentials,
  AuthResponse,
  AuthUser,
  AuthTokens,
} from "@/domain/entities/Auth";

export interface IAuthRepository {
  /**
   * Login user with credentials
   * @param credentials - User email and password
   * @returns AuthResponse with tokens and user data
   */
  login(credentials: LoginCredentials): Promise<AuthResponse>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Current refresh token
   * @returns New auth tokens
   */
  refreshToken(refreshToken: string): Promise<AuthTokens>;

  /**
   * Get current authenticated user
   * @param token - Access token
   * @returns Current user data
   */
  getCurrentUser(token: string): Promise<AuthUser>;

  /**
   * Verify email with token
   * @param token - Email verification token
   */
  verifyEmail(token: string): Promise<void>;

  /**
   * Send forgot password email
   * @param email - User email
   */
  forgotPassword(email: string): Promise<void>;

  /**
   * Reset password with token
   * @param token - Reset password token
   * @param newPassword - New password
   */
  resetPassword(token: string, newPassword: string): Promise<void>;

  /**
   * Register new user
   * @param data - Registration data
   */
  register(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }): Promise<void>;
}
