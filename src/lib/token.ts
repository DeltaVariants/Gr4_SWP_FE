/**
 * Utility function để lấy access token
 * Ưu tiên: localStorage -> .env
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    // Server-side: chỉ dùng env token
    return process.env.NEXT_PUBLIC_API_TOKEN || null;
  }

  // Client-side: ưu tiên localStorage
  const token = localStorage.getItem("accessToken");

  // Fallback to env token nếu không có trong localStorage
  return token || process.env.NEXT_PUBLIC_API_TOKEN || null;
};

/**
 * Utility function để tạo Authorization header
 */
export const getAuthHeader = ():
  | { Authorization: string }
  | Record<string, never> => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Kiểm tra xem có token hợp lệ không
 */
export const hasValidToken = (): boolean => {
  return !!getAccessToken();
};
