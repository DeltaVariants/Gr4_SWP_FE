/**
 * Register Use Case
 * Business logic for user registration
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { RegisterData, AuthResponse } from '@/domain/entities/Auth';

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: RegisterData): Promise<AuthResponse> {
    // Validation
    if (!data.email || data.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (!data.password || data.password.trim().length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!data.fullName || data.fullName.trim().length === 0) {
      throw new Error('Full name is required');
    }

    if (!data.phoneNumber || data.phoneNumber.trim().length === 0) {
      throw new Error('Phone number is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Phone number validation (simple check)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(data.phoneNumber.replace(/[\s-]/g, ''))) {
      throw new Error('Invalid phone number format');
    }

    try {
      const response = await this.authRepository.register(data);
      
      console.log('[RegisterUseCase] Registration successful:', {
        userId: response.user.userId,
        email: response.user.email,
      });

      return response;
    } catch (error: any) {
      console.error('[RegisterUseCase] Registration failed:', error);
      
      if (error.response?.status === 409) {
        throw new Error('Email already exists');
      }
      
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  }
}
