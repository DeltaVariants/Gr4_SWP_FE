/**
 * Auth Use Cases
 * Export all configured auth use case instances
 */

import { authRepository } from '@/infrastructure/repositories/AuthRepository';
import { LoginUseCase } from './LoginUseCase';
import { RegisterUseCase } from './RegisterUseCase';
import { LogoutUseCase } from './LogoutUseCase';
import { GetCurrentUserUseCase } from './GetCurrentUserUseCase';

// Export configured use case instances (singleton)
export const loginUseCase = new LoginUseCase(authRepository);
export const registerUseCase = new RegisterUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

// Export classes for testing or custom instantiation
export { LoginUseCase, RegisterUseCase, LogoutUseCase, GetCurrentUserUseCase };
