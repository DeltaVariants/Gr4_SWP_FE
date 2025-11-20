import { BatteryType } from "@/domain/entities/BatteryType";
import { IBatteryTypeRepository } from "@/domain/repositories/BatteryTypeRepository";
import api from "@/lib/api";

class BatteryTypeRepositoryAPI implements IBatteryTypeRepository {
  /**
   * Lấy danh sách tất cả battery types
   */
  async getAll(): Promise<BatteryType[]> {
    const endpoint = "/battery-types";

    try {
      console.log("Fetching battery types from URL:", endpoint);

      const response = await api.get(endpoint);

      console.log("Raw Battery Type API Response:", response.data);

      // Validate response structure
      if (!response.data) {
        throw new Error("Invalid API response: no data");
      }

      // API trả về array trực tiếp hoặc object với data array
      let batteryTypes: BatteryType[];

      if (Array.isArray(response.data)) {
        batteryTypes = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        batteryTypes = response.data.data;
      } else {
        throw new Error(
          "Invalid API response: expected array of battery types"
        );
      }

      console.log("Battery types count:", batteryTypes.length);
      return batteryTypes;
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
          `Failed to fetch battery types: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch battery types: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch battery types: ${
            axiosError.message || "Unknown error"
          }`
        );
      }
    }
  }

  /**
   * Lấy thông tin battery type theo ID
   */
  async getById(batteryTypeId: string): Promise<BatteryType | null> {
    const endpoint = `/battery-types/${batteryTypeId}`;

    try {
      console.log("Fetching battery type from URL:", endpoint);

      const response = await api.get(endpoint);

      console.log("Raw Battery Type API Response:", response.data);

      if (!response.data) {
        return null;
      }

      // API có thể trả về object trực tiếp hoặc wrapper
      const batteryType: BatteryType = response.data.data || response.data;

      return batteryType;
    } catch (error) {
      const axiosError = error as {
        response?: { status: number; statusText: string; data: unknown };
        request?: unknown;
        message?: string;
      };

      if (axiosError.response?.status === 404) {
        return null;
      }

      if (axiosError.response) {
        console.error(
          `API error: ${axiosError.response.status}`,
          axiosError.response.data
        );
        throw new Error(
          `Failed to fetch battery type: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch battery type: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch battery type: ${
            axiosError.message || "Unknown error"
          }`
        );
      }
    }
  }
}

export const batteryTypeRepositoryAPI = new BatteryTypeRepositoryAPI();
