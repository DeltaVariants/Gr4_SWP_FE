/**
 * Use Case: Get Current User
 * Clean Architecture - Application Layer
 */

import { IAuthRepository } from "@/domain/repositories/AuthRepository";
import { AuthUser } from "@/domain/entities/Auth";

export class GetCurrentUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(token: string): Promise<AuthUser> {
    if (!token) {
      throw new Error("Token is required");
    }

    return await this.authRepository.getCurrentUser(token);
  }
}
