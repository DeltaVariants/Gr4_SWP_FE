import api from "@/lib/api";
import { IBatteryUpdateRepository } from "@/domain/repositories/BatteryUpdateRepository";
import {
  BatteryUpdateRequest,
  BatteryUpdateResponse,
} from "@/domain/entities/BatteryUpdate";

export class BatteryUpdateRepositoryAPIImpl
  implements IBatteryUpdateRepository
{
  async updateBattery(
    batteryID: string,
    data: BatteryUpdateRequest
  ): Promise<BatteryUpdateResponse> {
    try {
      const response = await api.patch<BatteryUpdateResponse>(
        `/batteries/${batteryID}`,
        data
      );

      if (!response.data) {
        throw new Error("Invalid response from API");
      }

      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        throw new Error(
          axiosError.response?.data?.message || "Failed to update battery"
        );
      }
      throw new Error("Network error: Failed to update battery");
    }
  }
}
