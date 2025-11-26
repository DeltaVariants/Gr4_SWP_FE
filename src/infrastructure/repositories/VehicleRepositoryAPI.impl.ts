import { Vehicle } from "@/domain/entities/Vehicle";
import { IVehicleRepository } from "@/domain/repositories/VehicleRepository";
import api from "@/lib/api";

class VehicleRepositoryAPI implements IVehicleRepository {
  /**
   * Lấy danh sách xe của người dùng
   */
  async getAll(): Promise<Vehicle[]> {
    const endpoint = "/me/vehicles";

    try {
      console.log("Fetching vehicles from URL:", endpoint);

      const response = await api.get(endpoint);

      console.log("Raw Vehicle API Response:", response.data);

      // Validate response structure
      if (!response.data) {
        throw new Error("Invalid API response: no data");
      }

      // API trả về array trực tiếp hoặc object với data array
      let vehicles: Vehicle[];

      if (Array.isArray(response.data)) {
        vehicles = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        vehicles = response.data.data;
      } else {
        throw new Error("Invalid API response: expected array of vehicles");
      }

      console.log("Vehicles count:", vehicles.length);
      return vehicles;
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
          `Failed to fetch vehicles: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch vehicles: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch vehicles: ${axiosError.message || "Unknown error"}`
        );
      }
    }
  }

  /**
   * Lấy thông tin xe theo ID
   */
  async getById(vehicleId: string): Promise<Vehicle | null> {
    const endpoint = `/vehicles/${vehicleId}`;

    try {
      console.log("Fetching vehicle from URL:", endpoint);

      const response = await api.get(endpoint);

      console.log("Raw Vehicle API Response:", response.data);

      if (!response.data) {
        return null;
      }

      // API có thể trả về object trực tiếp hoặc wrapper
      const vehicle: Vehicle = response.data.data || response.data;

      return vehicle;
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
          `Failed to fetch vehicle: ${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else if (axiosError.request) {
        console.error(
          "Network error - no response received:",
          axiosError.request
        );
        throw new Error(
          "Failed to fetch vehicle: Network error. This might be a CORS issue."
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        throw new Error(
          `Failed to fetch vehicle: ${axiosError.message || "Unknown error"}`
        );
      }
    }
  }
}

export const vehicleRepositoryAPI = new VehicleRepositoryAPI();
