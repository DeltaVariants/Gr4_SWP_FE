// Hàm này sẽ triển khai "Hợp đồng" IStationRepository
// Nơi mà fetch thực sự được gọi

import { Station } from "@/domain/dto/Hoang/Station";
import {
  IStationRepository,
  CreateStationRequest,
} from "@/domain/repositories/Hoang/StationRepository";
import api from "@/lib/api";

// Lớp này "Triển khai" (implements) cái "Hợp đồng" IStationRepository
class StationRepositoryAPI implements IStationRepository {
  /**
   * Triển khai cụ thể getAll() để fetch từ API
   * Sử dụng axios instance đã được config sẵn trong @/lib/api
   * để tự động xử lý auth headers và CORS
   */
  async getAll(): Promise<Station[]> {
    const endpoint = "/stations";

    try {
      // Sử dụng axios instance thay vì fetch để có auth headers và CORS config
      const response = await api.get(endpoint);

      console.log("Raw API Response:", response.data);

      // Backend trả về trực tiếp array
      if (!Array.isArray(response.data)) {
        console.error(
          "Expected array but got:",
          typeof response.data,
          response.data
        );
        throw new Error("Invalid API response: expected array of stations");
      }

      console.log("Stations count:", response.data.length);
      return response.data as Station[];
    } catch (error) {
      // Axios error có cấu trúc khác với fetch error
      const axiosError = error as {
        response?: { status: number; statusText: string; data: unknown };
        request?: unknown;
        message?: string;
      };
      if (axiosError.response) {
        // Server trả về response với status code lỗi
        console.error(
          `API error: ${axiosError.response.status}`,
          axiosError.response.data
        );
        throw new Error(
          `Failed to fetch stations: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        // Request được gửi nhưng không nhận được response (có thể do CORS)
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch stations: Network error. This might be a CORS issue."
        );
      } else {
        // Lỗi khác khi setup request
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch stations: ${axiosError.message || "Unknown error"}`
        );
      }
    }
  }

  /**
   * Triển khai cụ thể create() để tạo trạm mới qua API
   */
  async create(stationData: CreateStationRequest): Promise<Station> {
    const endpoint = "/stations";

    try {
      const response = await api.post(endpoint, stationData);

      console.log("Create Station Response:", response.data);

      // Kiểm tra response có hợp lệ không
      if (!response.data) {
        throw new Error("Invalid API response: no data returned");
      }

      return response.data as Station;
    } catch (error) {
      const axiosError = error as {
        response?: { status: number; statusText: string; data: unknown };
        request?: unknown;
        message?: string;
      };

      if (axiosError.response) {
        console.error(
          `API error: ${axiosError.response.status}`,
          axiosError.response.data
        );

        // Trích xuất message từ response nếu có
        const errorMessage =
          typeof axiosError.response.data === "object" &&
          axiosError.response.data !== null &&
          "message" in axiosError.response.data
            ? (axiosError.response.data as { message: string }).message
            : JSON.stringify(axiosError.response.data);

        throw new Error(
          `Failed to create station: ${
            errorMessage || axiosError.response.statusText
          }`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to create station: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to create station: ${axiosError.message || "Unknown error"}`
        );
      }
    }
  }

  /**
   * Triển khai cụ thể delete() để xóa trạm qua API
   * API yêu cầu xóa theo tên trạm (station name)
   */
  async delete(stationName: string): Promise<void> {
    // Encode station name để xử lý các ký tự đặc biệt trong URL
    const encodedName = encodeURIComponent(stationName);
    const endpoint = `/stations/${encodedName}`;

    try {
      await api.delete(endpoint);
      console.log("Station deleted successfully:", stationName);
    } catch (error) {
      const axiosError = error as {
        response?: { status: number; statusText: string; data: unknown };
        request?: unknown;
        message?: string;
      };

      if (axiosError.response) {
        console.error(
          `API error: ${axiosError.response.status}`,
          axiosError.response.data
        );

        // Trích xuất message từ response nếu có
        const errorMessage =
          typeof axiosError.response.data === "object" &&
          axiosError.response.data !== null &&
          "message" in axiosError.response.data
            ? (axiosError.response.data as { message: string }).message
            : JSON.stringify(axiosError.response.data);

        throw new Error(
          `Failed to delete station: ${
            errorMessage || axiosError.response.statusText
          }`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to delete station: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to delete station: ${axiosError.message || "Unknown error"}`
        );
      }
    }
  }
}

//xuất ra một instance của lớp này
export const stationRepositoryAPI = new StationRepositoryAPI();

