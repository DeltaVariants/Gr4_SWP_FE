'use client';

/**
 * Auth Context - Clean Architecture Version
 * Sử dụng hooks từ presentation layer
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useAuthHook } from '@/presentation/hooks/useAuth';
import { AuthUser, LoginCredentials, RegisterData } from '@/domain/dto/Hoang/Auth';

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; [key: string]: any }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<AuthUser>;
  verifyEmail: (data: { token: string }) => Promise<void>;
  googleLogin: () => void;
}

// Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authHook = useAuthHook();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Load user on mount if token exists
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount
    
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      console.log('[AuthContext] Initializing auth, token exists:', !!token);
      
      if (token) {
        // Check if authHook already has user (from previous load or cache)
        if (authHook.user) {
          console.log('[AuthContext] User already loaded in hook, skipping API call');
          if (isMounted) {
            setIsInitialized(true);
            console.log('[AuthContext] Initialization complete (user exists)');
          }
          return;
        }
        
        // Try to get fresh user data from API
        try {
          console.log('[AuthContext] Loading user data from API...');
          const userData = await authHook.getCurrentUser();
          
          if (isMounted) {
            console.log('[AuthContext] User loaded successfully:', userData);
            // Cache is automatically updated by authHook
          }
        } catch (error: any) {
          if (!isMounted) return;
          
          // Silent error handling - don't spam console with errors
          if (error?.message?.includes('Session expired') || error?.message?.includes('401')) {
            console.warn('[AuthContext] Session expired during init - clearing auth data');
            // Clear all auth data on 401
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('role');
            localStorage.removeItem('userInfo');
          } else if (error?.message?.includes('Network') || error?.message?.includes('timeout')) {
            console.warn('[AuthContext] Network error during init - will retry on next action');
            // Keep token for retry later
          } else {
            console.error('[AuthContext] Failed to load user on init:', error?.message || error);
            // Clear tokens for unknown errors
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('role');
            localStorage.removeItem('userInfo');
          }
        }
      } else {
        console.log('[AuthContext] No token found, skipping user load');
      }
      
      if (isMounted) {
        setIsInitialized(true);
        console.log('[AuthContext] Initialization complete');
      }
    };

    initAuth();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Login wrapper with redirect
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authHook.login(credentials);
      
      // User data is already set by authHook.login() from login response
      // No need to call getCurrentUser() immediately - it may fail if backend has issues
      // User data will be refreshed on next page load if needed
      console.log('[AuthContext] Login successful, user data from login response:', authHook.user);
      
      // Get role from user data or localStorage
      const role = authHook.user?.role || localStorage.getItem('role') || 'EMPLOYEE';
      
      // NOTE: No need for session API - middleware reads directly from localStorage
      // Token is already stored in localStorage by LoginUseCase

      // Redirect based on role
      let redirectPath = '/';
      
      if (role === 'ADMIN') {
        redirectPath = '/dashboard';
      } else if (role === 'STAFF' || role === 'EMPLOYEE') {
        redirectPath = '/dashboardstaff';
      } else if (role === 'CUSTOMER' || role === 'DRIVER') {
        redirectPath = '/home';
      }

      console.log('[AuthContext] Redirecting to:', redirectPath);
      
      // Use router.replace to avoid going back to login
      router.replace(redirectPath);
      
      // Return response for LoginForm compatibility
      return { ...response, success: true };
    } catch (error: any) {
      // Return error response for LoginForm
      return { success: false, message: error?.message || 'Login failed' };
    }
  };

  // Logout wrapper with redirect
  const logout = async () => {
    await authHook.logout();
    
    // Clear server-side session
    try {
      await fetch('/api/auth/logout-local', { method: 'POST' });
    } catch (e) {
      console.warn('[AuthContext] Clearing server session failed:', e);
    }

    // Redirect to login
    router.replace('/login');
  };

  // Register wrapper
  const register = async (data: RegisterData) => {
    await authHook.register(data);
    // After registration, redirect to login or verify email page
    router.push('/login?registered=true');
  };

  // Google login handler
  const googleLogin = () => {
    console.log('[AuthContext] Starting Google login...');
    window.location.href = '/api/auth/google-login';
  };

  const value: AuthContextType = {
    user: authHook.user,
    loading: !isInitialized || authHook.loading, // Loading if not initialized OR hook is loading
    error: authHook.error,
    isAuthenticated: authHook.isAuthenticated,
    isAdmin: authHook.isAdmin,
    isStaff: authHook.isStaff,
    isCustomer: authHook.isCustomer,
    login,
    register,
    logout,
    getCurrentUser: authHook.getCurrentUser,
    verifyEmail: authHook.verifyEmail,
    googleLogin,
  };

  // Don't block render - let pages handle loading state via withAuth HOC
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
