import axios from 'axios';
import { refreshAccessToken } from './refreshToken';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor cho request
api.interceptors.request.use((config) => {
  // Lấy token từ localStorage nếu có
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Thêm interceptor cho response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Xử lý lỗi từ API
    if (error.response) {
      // Lỗi server trả về (401, 403, 500, etc.)
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url
      });

      // Nếu token hết hạn (401), tự động đăng xuất
      if (error.response.status === 401) {
        try {
          // Try to refresh the token
          const newAccessToken = await refreshAccessToken();
          
          // Retry the original request with new token
          const originalRequest = error.config;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, remove tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        // Có thể thêm code để redirect về trang đăng nhập ở đây
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Network Error:', error.request);
    } else {
      // Lỗi khi setup request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;