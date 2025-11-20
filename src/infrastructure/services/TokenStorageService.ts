/**
 * Token Storage Service
 * Clean Architecture - Infrastructure Layer
 */

import { AuthTokens } from "@/domain/entities/Auth";

class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = "accessToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  private readonly EXPIRES_AT_KEY = "expiresAt";

  /**
   * Save tokens to localStorage
   */
  saveTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt);
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Failed to get refresh token:", error);
      return null;
    }
  }

  /**
   * Get expiry time from localStorage
   */
  getExpiresAt(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(this.EXPIRES_AT_KEY);
    } catch (error) {
      console.error("Failed to get expires at:", error);
      return null;
    }
  }

  /**
   * Get all tokens
   */
  getTokens(): AuthTokens | null {
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = this.getExpiresAt();

    if (!token || !refreshToken || !expiresAt) {
      return null;
    }

    return { token, refreshToken, expiresAt };
  }

  /**
   * Clear all tokens from localStorage
   */
  clearTokens(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.EXPIRES_AT_KEY);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return true;

    try {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      return expiryDate <= now;
    } catch {
      return true;
    }
  }

  /**
   * Check if has valid token
   */
  hasValidToken(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }
}

export const tokenStorage = new TokenStorageService();
