'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, LoginRequest, User, RegisterRequest } from '@/services/authService';

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  googleLogin: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
}

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
  googleLogin: () => {},
  forgotPassword: async () => ({ success: false }),
  verifyEmail: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  setUser: () => {},
  setIsAuthenticated: () => {},
});

// Hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Kiểm tra auth khi app khởi động
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error checking auth:', error);
        // Token không hợp lệ, xóa tokens và reset state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  // Lấy thông tin user từ API
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  // Hàm đăng nhập
  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      // Gọi API đăng nhập
      const response = await authService.login(credentials);
      
      console.log('Login response:', response);
      console.log('Response type:', typeof response);
      
      // Cast response to any để xử lý dynamic structure
      const responseData = response as any;
      console.log('authDTO exists (lowercase):', !!responseData.authDTO);
      console.log('authDTO content:', responseData.authDTO);
      
      // Backend trả về lowercase fields: token, refreshToken, authDTO
      if (!responseData.authDTO) {
        console.error('authDTO is missing from response:', response);
        throw new Error('Invalid response structure from server');
      }
      
      // Extract data từ response thực tế
      const accessToken = responseData.token;          // "token" 
      const refreshToken = responseData.refreshToken;  // "refreshToken"
      const user: User = {
        id: responseData.authDTO.userID,         // "userID"
        email: responseData.authDTO.email,       // "email"
        name: responseData.authDTO.username,     // "username"
        role: responseData.authDTO.roleName || 'EMPLOYEE',     // fallback role to avoid redirect errors
        phone: responseData.authDTO.phoneNumber  // "phoneNumber"
      };

      console.log('Processed user:', user);
      console.log('Access token:', accessToken ? 'EXISTS' : 'MISSING');
      
      // Lưu tokens vào localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // Thiết lập cookie server-side để tránh race condition với middleware
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: accessToken, role: user.role, maxAge: 60 * 60 }), // 1h
        });
      } catch {}
      
      // Set user data
      setUser(user);
      setIsAuthenticated(true);
      
      // Redirect dựa vào role
      const redirectPath = getRedirectPathByRole(user.role);
      // Dùng replace để tránh quay lại trang login khi Back
      try {
        router.replace(redirectPath);
      } catch {}
      // Fallback hard redirect nếu client router gặp vấn đề
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
          window.location.href = redirectPath;
        }
      }, 200);
      
      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error('Login error:', err);
      return { 
        success: false, 
        message: err.message || 'Đăng nhập thất bại' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng ký
  const register = async (userData: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      return { 
        success: true, 
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.' 
      };
    } catch (error) {
      const err = error as Error;
      console.error('Register error:', err);
      return { 
        success: false, 
        message: err.message || 'Đăng ký thất bại' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      // Gọi API logout (optional)
      await authService.logout();
      // Xóa cookie token/role phía server để middleware không coi là đã đăng nhập
      try {
        await fetch('/api/auth/logout-local', { method: 'POST' });
      } catch {}
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Xóa tokens và reset state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/login');
    }
  };

  // Hàm quên mật khẩu
  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      return { 
        success: true, 
        message: 'Email reset mật khẩu đã được gửi!' 
      };
    } catch (error) {
      const err = error as Error;
      console.error('Forgot password error:', err);
      return { 
        success: false, 
        message: err.message || 'Gửi email thất bại' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Hàm xác thực email
  const verifyEmail = async (token: string) => {
    setLoading(true);
    try {
      await authService.verifyEmail(token);
      return { 
        success: true, 
        message: 'Email đã được xác thực thành công!' 
      };
    } catch (error) {
      const err = error as Error;
      console.error('Verify email error:', err);
      return { 
        success: false, 
        message: err.message || 'Xác thực email thất bại' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Hàm reset mật khẩu
  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      return { 
        success: true, 
        message: 'Mật khẩu đã được reset thành công!' 
      };
    } catch (error) {
      const err = error as Error;
      console.error('Reset password error:', err);
      return { 
        success: false, 
        message: err.message || 'Reset mật khẩu thất bại' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Helper function để xác định redirect path dựa vào role
  const getRedirectPathByRole = (_role?: string): string => {
    // Theo yêu cầu: luôn chuyển về homepage sau khi đăng nhập
    return '/';
  };

  // Google Login handler - Use existing backend API
  const googleLogin = () => {
    console.log('Starting Google login with existing API...');
    // IMPORTANT: Redirect trực tiếp tới domain BE để cookie correlation/state
    // được đặt trên cùng một host với callback (/signin-google), tránh lỗi
    // "The oauth state was missing or invalid" khi đi qua proxy rewrite.
    // Đảm bảo NEXT_PUBLIC_API_URL trỏ đúng tới BE (ví dụ: https://gr4-swp-be2-sp25.onrender.com)
    // Gọi route FE để server-side redirect sang BE, đảm bảo cookie/state OAuth đúng domain
  // Updated: endpoint now lives under /api/auth/google-login
  window.location.href = `/api/auth/google-login`;
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    googleLogin,
    forgotPassword,
    verifyEmail,
    resetPassword,
    setUser,
    setIsAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};