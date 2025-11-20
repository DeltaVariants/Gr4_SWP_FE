import axios from "axios";
import { refreshAccessToken } from "./refreshToken";

// Tạo instance axios với cấu hình mặc định
// ENV đã có /api suffix nên không cần thêm
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api',
  headers: {
    "Content-Type": "application/json",
  },
});

// Log warning if API URL is not set (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('[API] NEXT_PUBLIC_API_URL not set, using fallback:', api.defaults.baseURL);
}

// Thêm interceptor cho request
api.interceptors.request.use(
  (config) => {
    // Ưu tiên lấy token từ localStorage
    let token = localStorage.getItem("accessToken");

    // Nếu không có token trong localStorage, sử dụng token từ .env (development/testing)
    if (!token && process.env.NEXT_PUBLIC_API_TOKEN) {
      token = process.env.NEXT_PUBLIC_API_TOKEN;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;

// Thêm interceptor cho response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý lỗi từ API
    if (error.response) {
      // Lỗi server trả về (401, 403, 500, etc.)
      const errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.response.data?.message || error.message,
        url: originalRequest?.url || 'unknown',
        method: originalRequest?.method || 'unknown',
      };
      
      // Suppress error logs for:
      // 1. 401 errors (expected when token expires)
      // 2. Logout 404s (expected)
      // 3. GET /api/bookings/{id} 405 (endpoint not supported)
      // 4. GET /api/bookings/search 405 (endpoint not supported)
      // 5. PATCH /api/bookings/{id} 404 (endpoint broken - returns "Swap transaction not found")
      // 6. PATCH /api/bookings/{id} 400 with "No available batteries" (handled in component)
      const isLogoutError = errorDetails.url?.includes('/logout') || errorDetails.url?.includes('/auth/logout');
      const isGetBookingById405 = error.response.status === 405 && errorDetails.url?.match(/\/bookings\/[^\/]+$/) && originalRequest?.method === 'get';
      const isSearchBooking405 = error.response.status === 405 && errorDetails.url?.includes('/bookings/search') && originalRequest?.method === 'get';
      const isPatchBookingById404 = error.response.status === 404 && errorDetails.url?.match(/\/bookings\/[^\/]+$/) && originalRequest?.method === 'patch';
      const isNoAvailableBatteries = error.response.status === 400 && 
                                     (errorDetails.message?.toLowerCase().includes('no available batteries') ||
                                      errorDetails.message?.toLowerCase().includes('no available battery'));
      const shouldSuppressLog = error.response.status === 401 || 
                                 (error.response.status === 404 && isLogoutError) ||
                                 isGetBookingById405 ||
                                 isSearchBooking405 ||
                                 isPatchBookingById404 ||
                                 isNoAvailableBatteries;
      
      if (!shouldSuppressLog) {
        console.error('[API Error]', errorDetails);
      } else {
        // Log as warning instead of error for suppressed logs
        console.warn('[API] Suppressed error log:', errorDetails);
      }

      // Nếu token hết hạn (401), tự động refresh token
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          console.log('[API] Attempting token refresh...');
          const newAccessToken = await refreshAccessToken();

          // Retry the original request with new token
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          console.log('[API] Retrying request with new token');
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login (ONCE)
          console.warn('[API] Token refresh failed, clearing auth data');
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          localStorage.removeItem("userInfo");
          
          // Only redirect once and only if not already on auth pages
          if (typeof window !== 'undefined' && !isRedirecting) {
            const pathname = window.location.pathname;
            const isAuthPage = pathname.includes('/login') || 
                              pathname.includes('/register') || 
                              pathname.includes('/forgotpassword') ||
                              pathname === '/';
            
            if (!isAuthPage) {
              isRedirecting = true;
              console.warn('[API] Redirecting to login due to auth failure');
              setTimeout(() => {
                window.location.href = "/login?session=expired";
                // Reset flag after redirect
                setTimeout(() => { isRedirecting = false; }, 2000);
              }, 100);
            }
          }
          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("[Network Error] No response received:", {
        url: originalRequest?.url || 'unknown',
        method: originalRequest?.method || 'unknown',
      });
    } else {
      // Lỗi khi setup request
      console.error("[Request Setup Error]", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
