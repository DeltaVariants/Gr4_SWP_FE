/**
 * Session Cookie Service
 * Clean Architecture - Infrastructure Layer
 */

import { UserRole } from "@/domain/entities/Auth";

interface SetSessionParams {
  token: string;
  role: UserRole;
  maxAge?: number;
}

class SessionCookieService {
  /**
   * Set server-side session cookies
   */
  async setSession(params: SetSessionParams): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          role: params.role,
          maxAge: params.maxAge || 60 * 60, // Default 1 hour
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to set session cookies:", error);
        return false;
      }

      const result = await response.json();
      if (!result.success) {
        console.error("Session cookie API returned failure:", result);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Setting server session failed:", error);
      return false;
    }
  }

  /**
   * Clear server-side session cookies
   */
  async clearSession(): Promise<void> {
    try {
      await fetch("/api/auth/logout-local", {
        method: "POST",
      });
    } catch (error) {
      console.warn("Clearing server session failed (non-fatal):", error);
    }
  }
}

export const sessionCookie = new SessionCookieService();
