import { StationBattery } from "@/domain/entities/StationBattery";
import {
  IStationBatteryRepository,
  BatteryQueryParams,
} from "@/domain/repositories/StationBatteryRepository";
import api from "@/lib/api";

class StationBatteryRepositoryAPI implements IStationBatteryRepository {
  /**
   * Triển khai cụ thể getBatteriesByStation() để fetch từ API
   */
  async getBatteriesByStation(
    stationID: string,
    params?: BatteryQueryParams
  ): Promise<StationBattery[]> {
    const endpoint = `/batteries/station/${stationID}/batteries`;

    try {
      console.log("Fetching station batteries from URL:", endpoint);
      console.log("Query params:", params);

      const response = await api.get(endpoint, { params });

      console.log("Raw Station Battery API Response:", response.data);

      // Validate response structure - API trả về trực tiếp array
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid API response: expected array of batteries");
      }

      console.log("Station batteries count:", response.data.length);
      return response.data as StationBattery[];
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
          `Failed to fetch station batteries: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch station batteries: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch station batteries: ${
            axiosError.message || "Unknown error"
          }`
        );
      }
    }
  }
}

export const stationBatteryRepositoryAPI = new StationBatteryRepositoryAPI();
