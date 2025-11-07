/**
 * Use Case: Refresh Token
 * Clean Architecture - Application Layer
 */

import { IAuthRepository } from "@/domain/repositories/AuthRepository";
import { AuthTokens } from "@/domain/entities/Auth";

export class RefreshTokenUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    return await this.authRepository.refreshToken(refreshToken);
  }
}
