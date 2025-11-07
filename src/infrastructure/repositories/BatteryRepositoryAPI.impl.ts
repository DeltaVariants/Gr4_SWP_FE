import { BatteryListResponse } from "@/domain/entities/Battery";
import {
  IBatteryRepository,
  GetBatteriesParams,
} from "@/domain/repositories/BatteryRepository";
import api from "@/lib/api";

class BatteryRepositoryAPI implements IBatteryRepository {
  /**
   * Triển khai cụ thể getAll() để fetch từ API
   */
  async getAll(params?: GetBatteriesParams): Promise<BatteryListResponse> {
    const endpoint = "/batteries";

    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      if (params?.pageNumber) {
        queryParams.append("pageNumber", params.pageNumber.toString());
      }
      if (params?.pageSize) {
        queryParams.append("pageSize", params.pageSize.toString());
      }
      if (params?.createDate) {
        queryParams.append("createDate", params.createDate);
      }
      if (params?.typeName) {
        queryParams.append("typeName", params.typeName);
      }
      if (params?.vehicleId) {
        queryParams.append("vehicleId", params.vehicleId);
      }

      const url = queryParams.toString()
        ? `${endpoint}?${queryParams.toString()}`
        : endpoint;

      console.log("Fetching batteries from URL:", url);

      const response = await api.get(url);

      console.log("Raw Battery API Response:", response.data);

      // Validate response structure
      if (!response.data || typeof response.data !== "object") {
        throw new Error("Invalid API response: expected object");
      }

      const data = response.data as BatteryListResponse;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch batteries");
      }

      if (!Array.isArray(data.data)) {
        throw new Error(
          "Invalid API response: expected array of batteries in data field"
        );
      }

      console.log("Batteries count:", data.data.length);
      return data;
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
        throw new Error(
          `Failed to fetch batteries: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch batteries: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch batteries: ${axiosError.message || "Unknown error"}`
        );
      }
    }
  }
}

export const batteryRepositoryAPI = new BatteryRepositoryAPI();
