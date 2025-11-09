import axios from "axios";
import { refreshAccessToken } from "./refreshToken";

// Tạo instance axios với cấu hình mặc định
// ENV đã có /api suffix nên không cần thêm
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
      
      // Only log non-401 errors and non-logout 404s (401 is expected when token expires, logout 404 is expected)
      const isLogoutError = errorDetails.url?.includes('/logout') || errorDetails.url?.includes('/auth/logout');
      const shouldSuppressLog = error.response.status === 401 || (error.response.status === 404 && isLogoutError);
      
      if (!shouldSuppressLog) {
        console.error('[API Error]', errorDetails);
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
