/**
 * Auth Repository Implementation
 * Implements IAuthRepository using API calls
 */

import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthTokens,
  VerifyEmailData,
  ResetPasswordData,
  SendResetPasswordData,
} from '@/domain/entities/Auth';
import api from '@/lib/api';
import { getStationIdFromName } from '@/lib/stationResolver';

export class AuthRepository implements IAuthRepository {
  private readonly basePath = '/auth';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Call Next.js API route to set httpOnly cookies for middleware
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        const errorMsg = errorData.message || 'Login failed';
        
        // Provide user-friendly error messages
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 404) {
          throw new Error('Account not found');
        } else if (response.status === 403) {
          throw new Error('Account is disabled or not verified');
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();

    console.log('[AuthRepository] Backend response:', data);

    // API route returns: { success, token, refreshToken, authDTO: { ... } }
    const accessToken = data.token || data.accessToken;
    const refreshToken = data.refreshToken || data.refresh_token;

    // Store tokens in localStorage (cookies already set by API route)
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Extract user data from authDTO
    const userData = data.authDTO || data.user || data.data || data;
    
    // Extract role (may be nested object or string)
    let roleValue = userData.roleName || userData.role || userData.Role || userData.RoleName;
    
    // If role is an object, extract name
    if (roleValue && typeof roleValue === 'object') {
      roleValue = roleValue.name || roleValue.Name || roleValue.roleName || roleValue.RoleName;
    }
    
    // Fallback: Check roleID field and map to role name
    if (!roleValue && (userData.roleID || userData.RoleID || userData.roleId || userData.RoleId)) {
      const roleId = userData.roleID || userData.RoleID || userData.roleId || userData.RoleId;
      // Common roleID mapping
      if (roleId === 1 || roleId === '1') roleValue = 'ADMIN';
      else if (roleId === 2 || roleId === '2') roleValue = 'STAFF';
      else if (roleId === 3 || roleId === '3') roleValue = 'CUSTOMER';
    }
    
    const stationId = userData.stationId || userData.StationID || userData.stationID || userData.station_id;
    const stationName = userData.stationName || userData.StationName || userData.station_name;
    
    const user: AuthUser = {
      userId: userData.userID || userData.userId || userData.id || userData.ID,
      email: userData.email || userData.Email,
      fullName: userData.username || userData.fullName || userData.name || userData.Name || userData.FullName,
      role: roleValue,
      phoneNumber: userData.phoneNumber || userData.phone || userData.Phone,
      avatar: userData.avatar || userData.Avatar,
      stationId,
      stationName,
    };

    // Store role for middleware
    if (user.role) {
      localStorage.setItem('role', user.role);
    }

      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error: any) {
      console.error('[AuthRepository] Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post(`${this.basePath}/register`, data);
    const responseData = response.data;

    // Extract user data
    const user: AuthUser = responseData.user || {
      userId: responseData.userId || responseData.id,
      email: responseData.email,
      fullName: responseData.fullName || responseData.name,
      role: responseData.role,
      phoneNumber: responseData.phoneNumber,
    };

    return {
      user,
      tokens: {
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
      },
    };
  }

  async logout(): Promise<void> {
    try {
      // Clear client-side storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userInfo');
      
      // Call logout-local API to clear httpOnly cookies
      await fetch('/api/auth/logout-local', { method: 'POST' });
      console.log('[AuthRepository] Logout successful');
    } catch (error) {
      console.error('[AuthRepository] Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post(`${this.basePath}/refresh`, { refreshToken });
    const data = response.data;

    // Store new tokens
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  }

  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await api.get(`${this.basePath}/me`);
      const rawData = response.data;
      
      // Handle nested structure (data.data, data.authDTO, or direct)
      const data = rawData.data || rawData.authDTO || rawData.user || rawData;
      
      if (!data || typeof data !== 'object') {
        console.error('[AuthRepository] Invalid user data structure:', rawData);
        throw new Error('Invalid user data received from server');
      }

    // Extract role (may be nested object or string)
    let roleValue = data.role || data.Role || data.roleName || data.RoleName;
    
    // If role is an object, extract name
    if (roleValue && typeof roleValue === 'object') {
      roleValue = roleValue.name || roleValue.Name || roleValue.roleName || roleValue.RoleName;
    }
    
    // Fallback: Check roleID field and map to role name
    if (!roleValue && (data.roleID || data.RoleID || data.roleId || data.RoleId)) {
      const roleId = data.roleID || data.RoleID || data.roleId || data.RoleId;
      // Common roleID mapping (adjust based on your backend)
      if (roleId === 1 || roleId === '1') roleValue = 'ADMIN';
      else if (roleId === 2 || roleId === '2') roleValue = 'STAFF';
      else if (roleId === 3 || roleId === '3') roleValue = 'CUSTOMER';
    }

      const stationId = data.stationId || data.StationID || data.stationID || data.station_id;
      const stationName = data.stationName || data.StationName || data.station_name;
      
      const user: AuthUser = {
        userId: data.userId || data.id || data.userID || data.ID,
        email: data.email || data.Email,
        fullName: data.fullName || data.name || data.Name || data.FullName || data.username,
        role: roleValue,
        phoneNumber: data.phoneNumber || data.phone || data.Phone,
        avatar: data.avatar || data.Avatar,
        stationId,
        stationName,
        status: data.status || data.Status,
        createdAt: data.createdAt || data.CreatedAt,
        updatedAt: data.updatedAt || data.UpdatedAt,
      };

      // Store role for middleware
      if (user.role) {
        localStorage.setItem('role', user.role);
      }

      return user;
    } catch (error: any) {
      // Handle common, expected errors quietly so they don't trigger dev overlays
      const status = error?.response?.status;

      if (status === 401) {
        // Session expired - expected when token is missing/invalid
        console.warn('[AuthRepository] getCurrentUser failed: 401 - Session expired');
        throw new Error('Session expired');
      }

      if (status === 404) {
        console.warn('[AuthRepository] getCurrentUser failed: 404 - User not found');
        throw new Error('User not found');
      }

      if (!error?.response) {
        // Network error / no response
        console.warn('[AuthRepository] getCurrentUser network error:', error?.message || error);
        throw new Error('Network error');
      }

      // Unexpected errors: log as error for debugging
      console.error('[AuthRepository] getCurrentUser failed:', error?.message || error);
      throw error;
    }
  }

  async verifyEmail(data: VerifyEmailData): Promise<void> {
    await api.post(`${this.basePath}/verify-email`, data);
  }

  async sendPasswordReset(data: SendResetPasswordData): Promise<void> {
    await api.post(`${this.basePath}/send-reset`, data);
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await api.post(`${this.basePath}/reset-password`, data);
  }

  /**
   * Update user profile
   * Uses PATCH /api/users/{id} endpoint
   * Tries multiple field name formats to match backend expectations
   */
  async updateProfile(data: { name?: string; phoneNumber?: string; userId?: string }): Promise<AuthUser> {
    try {
      // Get current user to get userId if not provided
      let userId = data.userId;
      let currentUser: AuthUser | null = null;
      
      if (!userId) {
        currentUser = await this.getCurrentUser();
        userId = currentUser.userId;
      } else {
        try {
          currentUser = await this.getCurrentUser();
        } catch (e) {
          console.warn('[AuthRepository] Could not get current user:', e);
        }
      }

      if (!userId) {
        throw new Error('User ID is required to update profile');
      }

      // Validate input
      if (!data.name && !data.phoneNumber) {
        throw new Error('At least one field (name or phoneNumber) must be provided');
      }

      // Prepare payload variants - try different field name formats
      const payloadVariants: Array<Record<string, string>> = [];
      
      // Only add fields that are provided
      if (data.name) {
        payloadVariants.push(
          { fullName: data.name },
          { FullName: data.name },
          { username: data.name },
          { Username: data.name },
          { name: data.name },
          { Name: data.name },
        );
      }
      
      if (data.phoneNumber) {
        payloadVariants.push(
          { phoneNumber: data.phoneNumber },
          { PhoneNumber: data.phoneNumber },
          { phone: data.phoneNumber },
          { Phone: data.phoneNumber },
        );
      }

      // Combine name and phoneNumber variants
      const combinedVariants: Array<Record<string, string>> = [];
      
      if (data.name && data.phoneNumber) {
        // Try all combinations of name and phoneNumber field names
        combinedVariants.push(
          { fullName: data.name, phoneNumber: data.phoneNumber },
          { FullName: data.name, PhoneNumber: data.phoneNumber },
          { username: data.name, phoneNumber: data.phoneNumber },
          { Username: data.name, PhoneNumber: data.phoneNumber },
          { fullName: data.name, PhoneNumber: data.phoneNumber },
          { FullName: data.name, phoneNumber: data.phoneNumber },
        );
      } else {
        // Single field variants
        combinedVariants.push(...payloadVariants);
      }

      let lastError: any = null;

      // Try each payload format until one works
      for (const payload of combinedVariants) {
        try {
          console.log('[AuthRepository] Trying update profile:', { 
            userId, 
            payload: JSON.stringify(payload, null, 2) 
          });

          const response = await api.patch(`/users/${userId}`, payload);
          const responseData = response.data;

          console.log('[AuthRepository] ✅ Update profile success!');
          console.log('[AuthRepository] Response:', JSON.stringify(responseData, null, 2));

          // Refresh current user data
          const updatedUser = await this.getCurrentUser();
          
          return updatedUser;
        } catch (error: any) {
          lastError = error;
          const errorResponse = error?.response;
          const errorData = errorResponse?.data;
          
          // Parse error response to get detailed message
          let errorMessage = '';
          let errorDetails: any = {};
          
          try {
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (errorData) {
              errorMessage = 
                errorData.message || 
                errorData.error ||
                errorData.Message ||
                errorData.Error ||
                errorData.title ||
                '';
              
              // Get validation errors if any
              if (errorData.errors) {
                errorDetails.errors = errorData.errors;
              }
              
              // Get all keys for debugging
              errorDetails.keys = Object.keys(errorData);
            }
          } catch (e) {
            console.warn('[AuthRepository] Could not parse error data:', e);
          }

          // Log detailed error information
          console.error('[AuthRepository] ❌ Update failed:', {
            payload: JSON.stringify(payload, null, 2),
            status: errorResponse?.status,
            statusText: errorResponse?.statusText,
            errorMessage: errorMessage || 'No error message',
            errorData: errorData,
            errorDetails: errorDetails,
            responseHeaders: errorResponse?.headers,
          });

          // Log full errorData as JSON for detailed inspection
          console.error('[AuthRepository] Full errorData:', JSON.stringify(errorData, null, 2));
          
          // Log errors object separately if it exists
          if (errorData?.errors) {
            console.error('[AuthRepository] Validation errors:', JSON.stringify(errorData.errors, null, 2));
          }

          // If 400, try next variant (might be wrong field names)
          if (errorResponse?.status === 400) {
            if (errorMessage) {
              console.error('[AuthRepository] Backend error message:', errorMessage);
            }
            
            // Log all keys in errorData to help identify the structure
            if (errorData && typeof errorData === 'object') {
              console.error('[AuthRepository] ErrorData keys:', Object.keys(errorData));
              console.error('[AuthRepository] ErrorData values:', Object.entries(errorData).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : v]));
            }
            
            // If this is not the last variant, try next
            if (payload !== combinedVariants[combinedVariants.length - 1]) {
              console.log('[AuthRepository] Trying next payload format...');
              continue;
            }
          }

          // For non-400 errors or last attempt, throw
          if (errorResponse?.status !== 400) {
            throw error;
          }
        }
      }

      // If all variants failed with 400, throw error with message
      const errorResponse = lastError?.response;
      if (errorResponse?.status === 400) {
        const errorData = errorResponse.data;
        let errorMessage = '';
        
        try {
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData) {
            errorMessage = 
              errorData.message || 
              errorData.error ||
              errorData.Message ||
              errorData.Error ||
              errorData.title ||
              'Invalid request. Please check your input.';
            
            // Add validation errors if any
            if (errorData.errors && typeof errorData.errors === 'object') {
              const validationErrors = Object.entries(errorData.errors)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('; ');
              if (validationErrors) {
                errorMessage += ` (${validationErrors})`;
              }
            }
          }
        } catch (e) {
          console.warn('[AuthRepository] Could not parse final error:', e);
        }
        
        throw new Error(errorMessage || 'Failed to update profile. Please check your input and try again.');
      }

      throw lastError || new Error('Failed to update profile');
    } catch (error: any) {
      console.error('[AuthRepository] Update profile error:', error);
      
      // Re-throw if it's already our custom error
      if (error instanceof Error && error.message) {
        throw error;
      }
      
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to update profile');
    }
  }

  /**
   * Change user password
   * Note: Backend may not have a dedicated change password endpoint
   * This function tries multiple endpoints and payload formats
   */
  async changePassword(data: { currentPassword: string; newPassword: string; userId?: string }): Promise<void> {
    try {
      // Get current user to get userId if not provided
      let userId = data.userId;
      if (!userId) {
        const currentUser = await this.getCurrentUser();
        userId = currentUser.userId;
      }

      if (!userId) {
        throw new Error('User ID is required to change password');
      }

      // Get user email for potential payload variants
      let userEmail = '';
      try {
        const currentUser = await this.getCurrentUser();
        userEmail = currentUser.email;
      } catch (e) {
        console.warn('[AuthRepository] Could not get user email:', e);
      }

      // Try different endpoints and payload formats
      // Note: /auth/change-password returns 400 (exists but wrong payload), so prioritize it
      const attempts = [
        // Attempt 1: POST to /auth/change-password (endpoint exists, need correct payload)
        {
          method: 'post' as const,
          url: `/auth/change-password`,
          payloads: [
            // Try various field name combinations
            { currentPassword: data.currentPassword, newPassword: data.newPassword },
            { CurrentPassword: data.currentPassword, NewPassword: data.newPassword },
            { oldPassword: data.currentPassword, newPassword: data.newPassword },
            { OldPassword: data.currentPassword, NewPassword: data.newPassword },
            { currentPassword: data.currentPassword, password: data.newPassword },
            { password: data.newPassword, currentPassword: data.currentPassword },
            ...(userEmail ? [{ email: userEmail, currentPassword: data.currentPassword, newPassword: data.newPassword }] : []),
            { userId, currentPassword: data.currentPassword, newPassword: data.newPassword },
            { UserId: userId, CurrentPassword: data.currentPassword, NewPassword: data.newPassword },
            { userID: userId, currentPassword: data.currentPassword, newPassword: data.newPassword },
            { email: userEmail || '', currentPassword: data.currentPassword, newPassword: data.newPassword },
          ],
        },
        // Attempt 2: POST to change-password endpoint (if exists)
        {
          method: 'post' as const,
          url: `/users/${userId}/change-password`,
          payloads: [
            { currentPassword: data.currentPassword, newPassword: data.newPassword },
            { CurrentPassword: data.currentPassword, NewPassword: data.newPassword },
            { oldPassword: data.currentPassword, newPassword: data.newPassword },
          ],
        },
        // Attempt 3: POST to password endpoint
        {
          method: 'post' as const,
          url: `/users/${userId}/password`,
          payloads: [
            { currentPassword: data.currentPassword, newPassword: data.newPassword },
            { password: data.newPassword, currentPassword: data.currentPassword },
          ],
        },
        // Attempt 4: POST to Auth endpoint (capital A)
        {
          method: 'post' as const,
          url: `/Auth/ChangePassword`,
          payloads: [
            { currentPassword: data.currentPassword, newPassword: data.newPassword, userId },
            { CurrentPassword: data.currentPassword, NewPassword: data.newPassword, UserId: userId },
          ],
        },
      ];

      let lastError: any = null;

      // Try each endpoint with different payload formats
      for (const attempt of attempts) {
        for (const payload of attempt.payloads) {
          try {
            console.log('[AuthRepository] Trying change password:', { 
              method: attempt.method, 
              url: attempt.url,
              payload 
            });
            
            await api.post(attempt.url, payload);
            
            console.log('[AuthRepository] Change password successful!');
            return; // Success, exit
          } catch (error: any) {
            lastError = error;
            const errorResponse = error?.response;
            const status = errorResponse?.status;
            const errorData = errorResponse?.data;

            // Log detailed error information
            console.log('[AuthRepository] Attempt failed:', {
              url: attempt.url,
              status,
              statusText: errorResponse?.statusText,
              payload: payload,
              errorData: errorData,
              errorMessage: errorData?.message || errorData?.error || errorData?.Message || errorData?.Error,
              errorString: typeof errorData === 'string' ? errorData : null,
              fullError: errorResponse,
            });

            // Log full errorData as JSON for detailed inspection
            console.error('[AuthRepository] Full errorData (changePassword):', JSON.stringify(errorData, null, 2));
            
            // Log errors object separately if it exists
            if (errorData?.errors) {
              console.error('[AuthRepository] Validation errors (changePassword):', JSON.stringify(errorData.errors, null, 2));
            }

            // Log all keys in errorData to help identify the structure
            if (errorData && typeof errorData === 'object') {
              console.error('[AuthRepository] ErrorData keys (changePassword):', Object.keys(errorData));
              console.error('[AuthRepository] ErrorData values (changePassword):', Object.entries(errorData).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : v]));
            }

            // If 401 (unauthorized), current password is wrong - throw immediately
            if (status === 401) {
              const errorMsg = errorData?.message || errorData?.error || errorData?.Message || 'Current password is incorrect';
              throw new Error(errorMsg);
            }

            // If 404, try next endpoint
            if (status === 404) {
              console.log('[AuthRepository] 404 - Endpoint not found, trying next endpoint...');
              break; // Break to next endpoint
            }

            // If 400, log detailed error and try next payload
            if (status === 400) {
              const errorMsg = errorData?.message || errorData?.error || errorData?.Message || errorData?.Error;
              if (errorMsg) {
                console.error('[AuthRepository] 400 - Error message from backend:', errorMsg);
              }
              
              // If not last payload, try next payload format
              if (payload !== attempt.payloads[attempt.payloads.length - 1]) {
                console.log('[AuthRepository] 400 - Trying next payload format...');
                continue; // Try next payload format
              }
              
              // If last payload for this endpoint, try next endpoint
              console.log('[AuthRepository] 400 - All payloads failed for this endpoint, trying next endpoint...');
              break; // Break to next endpoint
            }

            // For other errors, throw immediately
            throw error;
          }
        }
      }

      // If all attempts failed
      if (lastError?.response?.status === 404) {
        throw new Error('Password change is not available. Please contact support.');
      }

      const errorResponse = lastError?.response;
      const errorMessage = 
        errorResponse?.data?.message || 
        errorResponse?.data?.error ||
        errorResponse?.data?.Message ||
        errorResponse?.data?.Error ||
        (typeof errorResponse?.data === 'string' ? errorResponse.data : null) ||
        'Failed to change password. Please check your current password and try again.';

      throw new Error(errorMessage);
    } catch (error: any) {
      console.error('[AuthRepository] Change password error:', error);
      
      // If it's already our custom error, throw it as is
      if (error instanceof Error && error.message) {
        throw error;
      }
      
      throw new Error(error?.response?.data?.message || error?.message || 'Failed to change password');
    }
  }
}

// Export singleton instance
export const authRepository = new AuthRepository();
