/**
 * Use Case: Login
 * Clean Architecture - Application Layer
 */

import { IAuthRepository } from "@/domain/repositories/AuthRepository";
import {
  LoginCredentials,
  AuthResponse,
  getRouteByRole,
} from "@/domain/entities/Auth";

export interface LoginResult {
  success: boolean;
  message?: string;
  data?: AuthResponse & { redirectPath: string };
}

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          message: "Email và mật khẩu không được để trống",
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        return {
          success: false,
          message: "Email không hợp lệ",
        };
      }

      // Call repository to login
      const authResponse = await this.authRepository.login(credentials);

      // Determine redirect path based on user role
      const redirectPath = getRouteByRole(authResponse.user.roleName);

      return {
        success: true,
        data: {
          ...authResponse,
          redirectPath,
        },
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || "Đăng nhập thất bại",
      };
    }
  }
}
