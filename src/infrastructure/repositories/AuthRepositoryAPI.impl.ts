/**
 * Infrastructure Repository Implementation: Authentication
 * Clean Architecture - Infrastructure Layer
 */

import { IAuthRepository } from "@/domain/repositories/AuthRepository";
import {
  LoginCredentials,
  AuthResponse,
  AuthUser,
  AuthTokens,
  normalizeRole,
} from "@/domain/entities/Auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://gr4-swp-be2-sp25.onrender.com";

// Type guards for API responses
interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface ApiLoginResponse {
  token?: string;
  Token?: string;
  refreshToken?: string;
  RefreshToken?: string;
  expiresAt?: string;
  ExpiresAt?: string;
  authDTO?: {
    userID?: string;
    UserID?: string;
    username?: string;
    Username?: string;
    email?: string;
    Email?: string;
    phoneNumber?: string;
    PhoneNumber?: string;
    stationName?: string | null;
    StationName?: string | null;
    roleName?: string;
    RoleName?: string;
  };
  AuthDTO?: {
    userID?: string;
    UserID?: string;
    username?: string;
    Username?: string;
    email?: string;
    Email?: string;
    phoneNumber?: string;
    PhoneNumber?: string;
    stationName?: string | null;
    StationName?: string | null;
    roleName?: string;
    RoleName?: string;
  };
  data?: {
    authDTO?: Record<string, unknown>;
  };
}

interface ApiRegisterResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

export class AuthRepositoryAPI implements IAuthRepository {
  /**
   * Login implementation
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Call backend API directly
      const response = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: credentials.email,
          Password: credentials.password,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      let json: ApiLoginResponse | ApiErrorResponse = {};
      let rawText = "";

      try {
        if (contentType.includes("application/json")) {
          json = await response.json();
        } else {
          rawText = await response.text();
        }
      } catch {
        // Ignore parse errors
      }

      if (!response.ok) {
        const errorResponse = json as ApiErrorResponse;
        const message = String(
          errorResponse?.message ||
            errorResponse?.error ||
            rawText ||
            "Đăng nhập thất bại"
        );
        throw new Error(message);
      }

      // Parse response with multiple format support
      const jsonData = json as ApiLoginResponse;
      const token = jsonData.token ?? jsonData.Token;
      const refreshToken = jsonData.refreshToken ?? jsonData.RefreshToken;
      const expiresAt = jsonData.expiresAt ?? jsonData.ExpiresAt;
      const authDTO =
        jsonData.authDTO ?? jsonData.AuthDTO ?? jsonData.data?.authDTO;

      if (!token || !authDTO) {
        throw new Error("Invalid response format from server");
      }

      // Map to domain entities
      const tokens: AuthTokens = {
        token: String(token),
        refreshToken: String(refreshToken || ""),
        expiresAt: String(expiresAt),
      };

      const user: AuthUser = {
        userID: String(authDTO.userID ?? authDTO.UserID ?? ""),
        username: String(authDTO.username ?? authDTO.Username ?? ""),
        email: String(authDTO.email ?? authDTO.Email ?? ""),
        phoneNumber: String(authDTO.phoneNumber ?? authDTO.PhoneNumber ?? ""),
        stationName: (authDTO.stationName ?? authDTO.StationName ?? null) as
          | string
          | null,
        roleName: normalizeRole(
          String(authDTO.roleName ?? authDTO.RoleName ?? "Customer")
        ),
      };

      return {
        tokens,
        user,
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || "Đăng nhập thất bại");
    }
  }

  /**
   * Logout implementation
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/api/Auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Logout should not throw errors
      console.error("Logout error:", error);
    }
  }

  /**
   * Refresh token implementation
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await fetch(`${API_URL}/Auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }), // Backend expects camelCase for refresh
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
          console.warn("[AuthRepository] Could not parse error response:", parseError);
        }
        
        // Log the error for debugging
        console.error("[AuthRepository] Refresh token failed:", {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
        });
        
        throw new Error(errorMessage || "Failed to refresh token");
      }

      const data = await response.json();

      // Backend returns: { token, refreshToken, expiresAt, authDTO }
      const newToken = data.token ?? data.Token;
      const newRefreshToken = data.refreshToken ?? data.RefreshToken;
      const expiresAt = data.expiresAt ?? data.ExpiresAt;

      if (!newToken) {
        throw new Error("No access token in refresh response");
      }

      return {
        token: String(newToken),
        refreshToken: String(newRefreshToken || refreshToken), // Fallback to old refresh token
        expiresAt: String(expiresAt || ""),
      };
    } catch (error) {
      const err = error as Error;
      
      // Handle network errors
      if (err.message.includes("fetch") || err.message.includes("Network") || err.message.includes("Failed to fetch")) {
        throw new Error("Network error: Unable to connect to server. Please check your internet connection.");
      }
      
      // Re-throw with original message if it's already an Error
      throw new Error(err.message || "Không thể làm mới token");
    }
  }

  /**
   * Get current user implementation
   */
  async getCurrentUser(token: string): Promise<AuthUser> {
    try {
      // Call backend API directly (PascalCase)
      const response = await fetch(`${API_URL}/Auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get user: ${errorText}`);
      }

      const data = await response.json();

      // Backend returns authDTO directly or nested
      const userData = data.authDTO ?? data.AuthDTO ?? data;

      return {
        userID: String(userData.userID ?? userData.UserID ?? userData.id ?? ""),
        username: String(
          userData.username ?? userData.Username ?? userData.name ?? ""
        ),
        email: String(userData.email ?? userData.Email ?? ""),
        phoneNumber: String(
          userData.phoneNumber ?? userData.PhoneNumber ?? userData.phone ?? ""
        ),
        stationName: (userData.stationName ?? userData.StationName ?? null) as
          | string
          | null,
        roleName: normalizeRole(
          String(
            userData.roleName ??
              userData.RoleName ??
              userData.role ??
              "Customer"
          )
        ),
      };
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || "Không thể lấy thông tin người dùng");
    }
  }

  /**
   * Verify email implementation
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/Auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Không thể xác thực email");
      }
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || "Không thể xác thực email");
    }
  }

  /**
   * Forgot password implementation
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/Auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || "Không thể gửi email khôi phục mật khẩu"
        );
      }
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || "Không thể gửi email khôi phục mật khẩu");
    }
  }

  /**
   * Reset password implementation
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Không thể đặt lại mật khẩu");
      }
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || "Không thể đặt lại mật khẩu");
    }
  }

  /**
   * Register implementation
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }): Promise<void> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type") || "";
      let parsed: ApiRegisterResponse = {};
      let rawText = "";

      try {
        if (contentType.includes("application/json")) {
          parsed = await response.json();
        } else {
          rawText = await response.text();
        }
      } catch {
        // Ignore parse errors
      }

      if (!response.ok || !parsed?.success) {
        let message = String(
          parsed?.message || parsed?.error || rawText || "Đăng ký thất bại"
        );
        if (response.status === 409) {
          message = "Email đã tồn tại, vui lòng sử dụng email khác";
        } else if (response.status >= 500) {
          message = "Máy chủ đang bận hoặc gặp sự cố. Vui lòng thử lại sau.";
        }
        throw new Error(message);
      }
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || "Đăng ký thất bại");
    }
  }
}

// Export singleton instance
export const authRepository = new AuthRepositoryAPI();
