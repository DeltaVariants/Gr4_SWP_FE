/**
 * ApiResponse - Backend Response Wrapper
 * Map từ backend C# ApiResponse<T>
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

