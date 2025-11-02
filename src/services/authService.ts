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
  stationId?: string;
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

      // Try to parse JSON safely
      const contentType = res.headers.get('content-type') || '';
      let json: any = {};
      let rawText = '';
      try {
        if (contentType.includes('application/json')) json = await res.json();
        else rawText = await res.text();
      } catch (e) {
        // ignore parse errors
      }

      // Always return an object describing the response so callers can handle different BE shapes
      const result = {
        status: res.status,
        ok: res.ok,
        success: json?.success ?? res.ok,
        message: json?.message || json?.error || rawText || (res.ok ? 'OK' : 'Đăng nhập thất bại'),
        ...json,
      };

      return result;
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
      // Chuẩn hóa input trước khi gửi
      const payload: RegisterRequest = {
        name: data.name?.trim(),
        email: data.email?.trim().toLowerCase(),
        password: data.password,
        phoneNumber: data.phoneNumber?.trim()
      };

      // Call Next.js API proxy to avoid CORS and map payload
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Chống lỗi parse khi server trả về non-JSON (e.g., "Internal Server Error")
      const contentType = response.headers.get('content-type') || '';
      let parsed: any = {};
      let rawText = '';
      try {
        if (contentType.includes('application/json')) {
          parsed = await response.json();
        } else {
          rawText = await response.text();
        }
      } catch {
        // fallback giữ parsed là {}
      }

      if (!response.ok || !parsed?.success) {
        // Ưu tiên message từ JSON, sau đó từ rawText, cuối cùng là theo status
        let message = parsed?.message || parsed?.error || rawText || 'Đăng ký thất bại';
        if (response.status === 409) {
          message = 'Email đã tồn tại, vui lòng sử dụng email khác';
        } else if (response.status >= 500) {
          message = 'Máy chủ đang bận hoặc gặp sự cố. Vui lòng thử lại sau.';
        }
        throw new Error(message);
      }

      return {
        success: true,
        data: parsed.data,
        message: 'Đăng ký thành công'
      };
    } catch (error: any) {
      // Giảm bớt log trùng lặp ở console (AuthContext cũng log)
      // console.error('Register error:', error);
      throw new Error(error?.message || 'Đăng ký thất bại');
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
      // Gọi qua Next API để dùng cookie httpOnly nếu có.
      // Nhưng khi đang ở client và token lưu trong localStorage, đính kèm header Authorization
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      try {
        if (typeof window !== 'undefined') {
          const t = localStorage.getItem('accessToken');
          if (t) headers['Authorization'] = `Bearer ${t}`;
        }
      } catch (e) {
        // ignore localStorage access errors
      }

      const res = await fetch('/api/auth/me', { cache: 'no-store', headers });
      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || 'Không thể lấy thông tin người dùng');
      }

      const userData = payload.data;
      console.log('Get current user response:', userData);
      
      return {
        id: userData.UserID || userData.userID || userData.id,
        email: userData.Email || userData.email,
        name: userData.Username || userData.username || userData.name,
        role: userData.RoleName || userData.roleName || userData.role || 'Driver',
        phone: userData.PhoneNumber || userData.phoneNumber || userData.phone,
        avatar: userData.Avatar || userData.avatar,
        // Backend may include station association under various names
        stationId: userData.StationID || userData.stationID || userData.stationId || userData.StationId || undefined,
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