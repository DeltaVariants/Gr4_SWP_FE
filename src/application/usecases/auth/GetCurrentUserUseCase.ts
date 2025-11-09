/**
 * Get Current User Use Case
 * Business logic for fetching current authenticated user
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { AuthUser } from '@/domain/entities/Auth';

export class GetCurrentUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<AuthUser> {
    try {
      // Check if token exists before making API call
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('[GetCurrentUserUseCase] No access token found');
        throw new Error('No authentication token found');
      }

      const user = await this.authRepository.getCurrentUser();
      
      console.log('[GetCurrentUserUseCase] User data received:', {
        userId: user.userId,
        role: user.role,
        stationId: user.stationId || 'NOT FOUND',
        stationName: user.stationName || 'NOT FOUND',
      });

      return user;
    } catch (error: any) {
      console.error('[GetCurrentUserUseCase] Failed to get user:', error);
      
      // Handle 401 Unauthorized - Clear tokens and force re-login
      if (error.response?.status === 401 || error.message?.includes('401')) {
        console.warn('[GetCurrentUserUseCase] Session expired, clearing tokens');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userInfo');
        
        // Redirect to login without throwing error to prevent error spam
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired');
      }
      
      // Handle network errors
      if (error.message?.includes('Network') || error.code === 'ERR_NETWORK') {
        console.error('[GetCurrentUserUseCase] Network error');
        throw new Error('Network error. Please check your connection.');
      }
      
      // Generic error
      throw new Error(error.message || 'Failed to get user information');
    }
  }
}
