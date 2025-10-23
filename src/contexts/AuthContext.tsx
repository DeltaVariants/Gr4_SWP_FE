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
      if (token) {
        try {
          // TODO: Khi backend có endpoint /me thì uncomment
          // await refreshUser();
          
          // Tạm thời chỉ set isAuthenticated = true nếu có token
          setIsAuthenticated(true);
          console.log('Found access token, user is authenticated');
        } catch (error) {
          console.error('Error checking auth:', error);
          // Token không hợp lệ, xóa tokens và reset state
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  // Lấy thông tin user từ API
  const refreshUser = async () => {
    try {
      // TODO: Backend chưa có endpoint /me, tạm thời skip
      // const userData = await authService.getCurrentUser();
      // setUser(userData);
      // setIsAuthenticated(true);
      console.log('refreshUser: Backend chưa có endpoint /me, skip for now');
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
        role: responseData.authDTO.roleName,     // "roleName" 
        phone: responseData.authDTO.phoneNumber  // "phoneNumber"
      };

      console.log('Processed user:', user);
      console.log('Access token:', accessToken ? 'EXISTS' : 'MISSING');
      
      // Lưu tokens vào localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set user data
      setUser(user);
      setIsAuthenticated(true);
      
      // Redirect dựa vào role
      const redirectPath = getRedirectPathByRole(user.role);
      router.push(redirectPath);
      
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
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Xóa tokens và reset state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
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
  const getRedirectPathByRole = (role: string): string => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return '/admin';
      case 'EMPLOYEE':
        return '/employee';
      case 'CUSTOMER':
        return '/customer';
      default:
        return '/dashboard';
    }
  };

  // Google Login handler - Use existing backend API
  const googleLogin = () => {
    console.log('Starting Google login with existing API...');
    // IMPORTANT: Redirect trực tiếp tới domain BE để cookie correlation/state
    // được đặt trên cùng một host với callback (/signin-google), tránh lỗi
    // "The oauth state was missing or invalid" khi đi qua proxy rewrite.
    // Đảm bảo NEXT_PUBLIC_API_URL trỏ đúng tới BE (ví dụ: https://gr4-swp-be2-sp25.onrender.com)
    // Gọi route FE để server-side redirect sang BE, đảm bảo cookie/state OAuth đúng domain
    window.location.href = `/auth/google-login`;
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