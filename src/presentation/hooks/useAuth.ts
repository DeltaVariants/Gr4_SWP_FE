'use client';

/**
 * useAuth Hook - Presentation Layer
 * Handles authentication logic and state management
 */

import { useState, useCallback, useEffect } from 'react';
import { authRepository } from '@/infrastructure/repositories/Hoang/AuthRepository';
import { AuthUser, LoginCredentials, RegisterData } from '@/domain/dto/Hoang/Auth';

export interface AuthHookReturn {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (data: { token: string }) => Promise<void>;
  getCurrentUser: () => Promise<AuthUser>;
  loadUserFromCache: () => AuthUser | null;
}

export const useAuth = (): AuthHookReturn => {
  // Initialize user from cache synchronously to avoid race conditions
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cachedUser = localStorage.getItem('userInfo');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
    } catch (e) {
      console.warn('[useAuth] Failed to load user from cache on init:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load user from localStorage cache
  const loadUserFromCache = useCallback((): AuthUser | null => {
    try {
      const cachedUser = localStorage.getItem('userInfo');
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        return userData;
      }
    } catch (e) {
      console.warn('[useAuth] Failed to load user from cache:', e);
    }
    return null;
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authRepository.login(credentials);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      await authRepository.register(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify email
  const verifyEmail = useCallback(async (data: { token: string }) => {
    try {
      await authRepository.verifyEmail(data);
    } catch (err: any) {
      console.error('[useAuth] verifyEmail error:', err);
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await authRepository.logout();
      setUser(null);
      
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userInfo');
    } catch (err: any) {
      console.error('[useAuth] Logout error:', err);
      // Clear local data even if API call fails
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current user
  const getCurrentUser = useCallback(async (): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authRepository.getCurrentUser();
      setUser(userData);
      
      // Cache user data
      localStorage.setItem('userInfo', JSON.stringify(userData));
      
      return userData;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user from cache on mount if not already loaded
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      console.log('[useAuth] Token exists but no user, loading from cache...');
      const cachedUser = loadUserFromCache();
      if (!cachedUser) {
        console.log('[useAuth] No cached user found, will need to fetch from API');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Computed properties
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF' || user?.role === 'EMPLOYEE';
  const isCustomer = user?.role === 'CUSTOMER' || user?.role === 'DRIVER';

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isStaff,
    isCustomer,
    login,
    register,
    logout,
    getCurrentUser,
    loadUserFromCache,
    verifyEmail,
  };
};