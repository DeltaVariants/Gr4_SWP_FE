/**
 * Logout Use Case
 * Business logic for user logout
 */

import { IAuthRepository } from '@/domain/repositories/Hoang/IAuthRepository';

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    try {
      console.log('[LogoutUseCase] Logging out user');
      await this.authRepository.logout();
      console.log('[LogoutUseCase] Logout successful');
    } catch (error) {
      console.error('[LogoutUseCase] Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
    }
  }
}
