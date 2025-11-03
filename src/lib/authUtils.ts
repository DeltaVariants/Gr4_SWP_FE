/**
 * Auth utilities for handling token expiration and session management
 */

/**
 * Handle 401 Unauthorized errors by clearing tokens and redirecting to login
 */
export function handle401Error(error?: any) {
  console.error('[Auth] 401 Unauthorized - Session expired');
  
  // Clear tokens
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    } catch (e) {
      console.warn('[Auth] Error clearing tokens:', e);
    }
  }
}

/**
 * Check if an error is a 401 Unauthorized error
 */
export function is401Error(error: any): boolean {
  if (!error) return false;
  
  // Check status code
  if (error.status === 401 || error.statusCode === 401) return true;
  
  // Check response status
  if (error.response?.status === 401) return true;
  
  // Check error message
  const message = error.message?.toLowerCase() || '';
  return message.includes('401') || 
         message.includes('unauthorized') || 
         message.includes('hết hạn') ||
         message.includes('expired');
}

/**
 * Get token from localStorage with error handling
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('accessToken');
  } catch (e) {
    console.warn('[Auth] Error reading token:', e);
    return null;
  }
}

/**
 * Set token in localStorage with error handling
 */
export function setToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem('accessToken', token);
    return true;
  } catch (e) {
    console.warn('[Auth] Error saving token:', e);
    return false;
  }
}

/**
 * Clear all auth tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (e) {
    console.warn('[Auth] Error clearing tokens:', e);
  }
}

/**
 * Create authorization headers with token
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}
