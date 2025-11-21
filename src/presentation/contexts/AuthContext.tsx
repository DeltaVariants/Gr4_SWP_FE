/**
 * Auth Context Provider - Clean Architecture
 * Presentation Layer
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// Domain
import { AuthUser, LoginCredentials, UserRole } from "@/domain/entities/Auth";

// Use Cases
import {
  LoginUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
  RefreshTokenUseCase,
} from "@/application/usecases/auth";

// Infrastructure
import { authRepository } from "@/infrastructure/repositories/AuthRepositoryAPI.impl";
import { tokenStorage } from "@/infrastructure/services/TokenStorageService";
import { sessionCookie } from "@/infrastructure/services/SessionCookieService";

// Initialize use cases
const loginUseCase = new LoginUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(authRepository);

// Context Type
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

// Hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    try {
      const userData = await getCurrentUserUseCase.execute(token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error refreshing user:", error);
      throw error;
    }
  }, []);

  /**
   * Check auth on app startup
   */
  useEffect(() => {
    const checkAuth = async () => {
      // Try to get token from localStorage first
      let token = tokenStorage.getAccessToken();
      
      // If no token in localStorage, try to recover from cookies
      if (!token && typeof window !== "undefined") {
        console.log("[AuthContext] No token in localStorage, checking cookies...");
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
        const roleCookie = cookies.find(c => c.trim().startsWith('role='));
        
        if (tokenCookie) {
          const recoveredToken = tokenCookie.split('=')[1];
          const recoveredRole = roleCookie?.split('=')[1];
          
          console.log("[AuthContext] Token recovered from cookies, restoring to localStorage");
          
          // Calculate token expiry (assume 24 hours if we can't decode)
          let expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          try {
            const parts = recoveredToken.split('.');
            if (parts.length >= 2) {
              const payload = JSON.parse(atob(parts[1]));
              if (payload.exp) {
                expiresAt = new Date(payload.exp * 1000).toISOString();
              }
            }
          } catch (e) {
            console.warn("[AuthContext] Could not decode token expiry");
          }
          
          tokenStorage.saveTokens({ 
            token: recoveredToken, 
            refreshToken: '', // We don't store refresh token in cookies
            expiresAt
          });
          token = recoveredToken;
        }
      }
      
      if (!token) return;

      try {
        // Check if token is expired
        if (tokenStorage.isTokenExpired()) {
          const refreshToken = tokenStorage.getRefreshToken();
          if (refreshToken) {
            try {
              // Try to refresh token
              const newTokens = await refreshTokenUseCase.execute(refreshToken);
              tokenStorage.saveTokens(newTokens);
              await sessionCookie.setSession({
                token: newTokens.token,
                role: user?.roleName || UserRole.CUSTOMER,
              });
            } catch (refreshError) {
              // Refresh token failed - clear tokens and stop here
              const err = refreshError as Error;
              console.warn("[AuthContext] Token refresh failed:", err.message);
              tokenStorage.clearTokens();
              // Don't auto-logout to avoid clearing session when user is still browsing
              // await sessionCookie.clearSession();
              setUser(null);
              setIsAuthenticated(false);
              return; // Don't try to refresh user if token refresh failed
            }
          } else {
            // No refresh token available
            console.warn("[AuthContext] No refresh token available");
            tokenStorage.clearTokens();
            // Don't auto-logout
            // await sessionCookie.clearSession();
            setUser(null);
            setIsAuthenticated(false);
            return;
          }
        }

        // If we got here, token is valid (either not expired or successfully refreshed)
        await refreshUser();
      } catch (error) {
        const err = error as Error;
        console.error("[AuthContext] Error checking auth:", err.message);
        // Clear invalid tokens
        tokenStorage.clearTokens();
        // Don't auto-logout when checking auth fails
        // await sessionCookie.clearSession();
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [refreshUser, user?.roleName]);

  /**
   * Login function
   */
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      console.log("[Auth] Starting login process...");

      // Execute login use case
      const result = await loginUseCase.execute(credentials);

      if (!result.success || !result.data) {
        console.error("[Auth] Login failed:", result.message);
        return {
          success: false,
          message: result.message || "Đăng nhập thất bại",
        };
      }

      const { tokens, user: userData, redirectPath } = result.data;

      console.log("[Auth] Login successful:", {
        user: userData.username,
        role: userData.roleName,
        redirectPath,
      });

      // Save tokens to localStorage
      tokenStorage.saveTokens(tokens);
      console.log("[Auth] Tokens saved to localStorage");

      // Set server-side session cookies
      console.log("[Auth] Setting session cookies...");
      const cookieSet = await sessionCookie.setSession({
        token: tokens.token,
        role: userData.roleName,
        maxAge: 60 * 60, // 1 hour
      });

      if (!cookieSet) {
        console.error("[Auth] Failed to set session cookies!");
        return {
          success: false,
          message: "Không thể tạo phiên đăng nhập. Vui lòng thử lại.",
        };
      }

      console.log("[Auth] Session cookies set successfully");

      // Update context state
      setUser(userData);
      setIsAuthenticated(true);

      // Wait a bit to ensure cookies are properly set
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Redirect based on user role
      console.log(`[Auth] Redirecting to: ${redirectPath}`);

      // Use window.location for reliable redirect with cookies
      if (typeof window !== "undefined") {
        window.location.href = redirectPath;
      }

      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error("[Auth] Login error:", err);
      return {
        success: false,
        message: err.message || "Đăng nhập thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      // Execute logout use case
      await logoutUseCase.execute();

      // Clear server-side session
      await sessionCookie.clearSession();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      tokenStorage.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/login");
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
