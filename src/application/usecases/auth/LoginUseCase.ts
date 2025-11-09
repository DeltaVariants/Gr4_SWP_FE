/**
 * Login Use Case
 * Business logic for user login
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { LoginCredentials, AuthResponse } from '@/domain/entities/Auth';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    // Validation
    if (!credentials.email || credentials.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (!credentials.password || credentials.password.trim().length === 0) {
      throw new Error('Password is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }

    try {
      const response = await this.authRepository.login(credentials);
      
      console.log('[LoginUseCase] Login successful:', {
        userId: response.user.userId,
        role: response.user.role,
      });

      return response;
    } catch (error: any) {
      console.error('[LoginUseCase] Login failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Account is disabled or suspended');
      }
      
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  }
}
