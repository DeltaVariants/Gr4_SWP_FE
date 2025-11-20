// Triển khai IUserRepository để fetch từ API thực tế

import { User } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/UserRepository";

/**
 * Lớp này triển khai IUserRepository để gọi API backend
 */
class UserRepositoryAPI implements IUserRepository {
  private readonly baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://gr4-swp-be2-sp25.onrender.com";

    if (!this.baseURL) {
      console.error("Base URL is not defined");
    }
  }

  /**
   * Helper method để lấy token
   * Ưu tiên: localStorage -> env token
   */
  private getToken(): string {
    if (typeof window !== "undefined") {
      // Client-side: ưu tiên localStorage
      const token = localStorage.getItem("accessToken");
      if (token) return token;
    }

    // Fallback to env token
    return process.env.NEXT_PUBLIC_API_TOKEN || "";
  }

  /**
   * Lấy danh sách tất cả người dùng với phân trang
   */
  async getAll(pageNumber: number, pageSize: number): Promise<User[]> {
    const endpoint = `/users?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const url = `${this.baseURL}${endpoint}`;

    try {
      const token = this.getToken();

      // Debug: log token để kiểm tra
      console.log(
        "[UserRepository] Fetching users with token:",
        token ? "Token exists" : "No token"
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store", // Không cache để luôn lấy dữ liệu mới nhất
      });

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        if (response.status === 401) {
          console.error("Unauthorized: Token may be invalid or expired");
        }
        throw new Error(`Failed to fetch users from: ${url}`);
      }

      // Parse JSON response
      const result = await response.json();

      // API trả về { success: true, message: "OK", data: [...] }
      const users: User[] = result.data || [];

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin user theo ID
   */
  async getById(userID: string): Promise<User | null> {
    const endpoint = `/api/users/${userID}`;
    const url = `${this.baseURL}${endpoint}`;

    try {
      const token = this.getToken();

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch user with ID: ${userID}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error(`Error fetching user ${userID}:`, error);
      throw error;
    }
  }

  /**
   * Xóa user theo ID
   */
  async delete(userID: string): Promise<void> {
    const endpoint = `/api/users/${userID}`;
    const url = `${this.baseURL}${endpoint}`;

    try {
      const token = this.getToken();

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete user with ID: ${userID}`
        );
      }
    } catch (error) {
      console.error(`Error deleting user ${userID}:`, error);
      throw error;
    }
  }
}

// Xuất ra một instance của lớp này
export const userRepositoryAPI = new UserRepositoryAPI();
