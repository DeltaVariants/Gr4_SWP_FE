import { SlotListResponse } from "@/domain/entities/Slot";
import {
  ISlotRepository,
  GetSlotsParams,
} from "@/domain/repositories/SlotRepository";
import api from "@/lib/api";

class SlotRepositoryAPI implements ISlotRepository {
  /**
   * Triển khai cụ thể getSlotsByStation() để fetch từ API
   */
  async getSlotsByStation(params: GetSlotsParams): Promise<SlotListResponse> {
    const { stationID, pageNumber, pageSize } = params;
    const endpoint = `/battery-slots/${stationID}/battery-slots`;

    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      if (pageNumber) {
        queryParams.append("pageNumber", pageNumber.toString());
      }
      if (pageSize) {
        queryParams.append("pageSize", pageSize.toString());
      }

      const url = queryParams.toString()
        ? `${endpoint}?${queryParams.toString()}`
        : endpoint;

      console.log("Fetching slots from URL:", url);
      const response = await api.get(url);

      console.log("Raw Slot API Response:", response.data);

      // Validate response structure
      if (!response.data || typeof response.data !== "object") {
        throw new Error("Invalid API response: expected object");
      }

      const data = response.data as SlotListResponse;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch slots");
      }

      if (!Array.isArray(data.data)) {
        throw new Error(
          "Invalid API response: expected array of slots in data field"
        );
      }

      console.log("Slots count:", data.data.length);
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
          `Failed to fetch slots: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch slots: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch slots: ${axiosError.message || "Unknown error"}`
        );
      }
    }
  }
}

export const slotRepositoryAPI = new SlotRepositoryAPI();
