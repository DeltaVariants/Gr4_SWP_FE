import api from '@/lib/api';

// Types
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginResponse {
  Token: string;           // Backend trả về "Token"
  RefreshToken: string;    // Backend trả về "RefreshToken"
  ExpiresAt: string;
  AuthDTO: {              // Backend trả về "AuthDTO"
    UserID: string;
    Username: string;
    Email: string;
    PhoneNumber: string;
    RoleName: string;     // Backend trả về "RoleName"
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Auth Service
export const authService = {
  // Đăng nhập
  async login(credentials: LoginRequest): Promise<any> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Đăng nhập thất bại');
      }
      return json;
    } catch (error) {
      const err = error as ApiError;
      throw new Error(
        (err as any)?.message || 'Đăng nhập thất bại'
      );
    }
  },

  // Đăng ký
  async register(data: RegisterRequest): Promise<ApiResponse<any>> {
    try {
      // Call Next.js API proxy to avoid CORS and map payload
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Đăng ký thất bại');
      }

      return {
        success: true,
        data: json.data,
        message: 'Đăng ký thành công'
      };
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Đăng ký thất bại');
    }
  },

  

  

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await api.post('/api/Auth/logout');
    } catch (error: any) {
      // Không cần throw error cho logout
      console.error('Logout error:', error);
    }
  },

  // Quên mật khẩu
  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/Auth/forgot-password', { email });
      return {
        success: true,
        data: response.data,
        message: 'Email khôi phục mật khẩu đã được gửi'
      };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Không thể gửi email khôi phục mật khẩu'
      );
    }
  },

  // Reset mật khẩu
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/Auth/reset-password', {
        token,
        newPassword
      });
      return {
        success: true,
        data: response.data,
        message: 'Mật khẩu đã được đặt lại thành công'
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Không thể đặt lại mật khẩu'
      );
    }
  },

  // Xác thực email
  async verifyEmail(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/Auth/verify-email', { token });
      return {
        success: true,
        data: response.data,
        message: 'Email đã được xác thực thành công'
      };
    } catch (error: any) {
      console.error('Verify email error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Không thể xác thực email'
      );
    }
  },

  // Refresh token
  async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/api/Auth/refresh', {
        refreshToken: refreshToken
      });
      
      console.log('Refresh token response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Refresh token error:', error);
      // Clear tokens nếu refresh fail
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Không thể làm mới token'
      );
    }
  },

  // Revoke token (logout)
  async revokeToken(): Promise<ApiResponse<any>> {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await api.post('/api/Auth/revoke', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Clear local tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return {
        success: true,
        data: response.data,
        message: 'Đăng xuất thành công'
      };
    } catch (error: any) {
      console.error('Revoke token error:', error);
      // Clear tokens anyway
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Lỗi khi đăng xuất'
      );
    }
  },

  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await api.get('/api/Auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Get current user response:', response.data);
      
      // Map response to User interface
      const userData = response.data;
      return {
        id: userData.UserID || userData.userID || userData.id,
        email: userData.Email || userData.email,
        name: userData.Username || userData.username || userData.name,
        role: userData.RoleName || userData.roleName || userData.role || 'Driver',
        phone: userData.PhoneNumber || userData.phoneNumber || userData.phone,
        avatar: userData.Avatar || userData.avatar
      };
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Không thể lấy thông tin người dùng'
      );
    }
  },

  // Xác thực đặt lại mật khẩu
  async verifyResetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/api/Auth/verify-reset-password', {
        token: token,
        newPassword: newPassword
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Mật khẩu đã được đặt lại thành công'
      };
    } catch (error: any) {
      console.error('Verify reset password error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Không thể đặt lại mật khẩu'
      );
    }
  }
};