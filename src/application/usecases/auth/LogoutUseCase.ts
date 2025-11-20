/**
 * Use Case: Logout
 * Clean Architecture - Application Layer
 */

import { IAuthRepository } from "@/domain/repositories/AuthRepository";

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      // Logout should not fail
      console.error("Logout use case error:", error);
    }
  }
}
