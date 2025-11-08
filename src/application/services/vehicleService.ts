import { vehicleRepositoryAPI } from "@/infrastructure/repositories/VehicleRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllVehiclesUseCase } from "../usecases/vehicle/GetAllVehicles.usecase";
import { getVehicleByIdUseCase } from "../usecases/vehicle/GetVehicleById.usecase";

/**
 * Redux Thunk: Fetch tất cả xe
 * Sử dụng Use Case layer để thực hiện business logic
 */
export const fetchAllVehicles = createAsyncThunk(
  "vehicles/fetchAll",
  async () => {
    try {
      // Gọi use case thay vì gọi repository trực tiếp
      const response = await getAllVehiclesUseCase(vehicleRepositoryAPI);
      return response;
    } catch (error) {
      throw error;
    }
  }
);

/**
 * Redux Thunk: Fetch xe theo ID
 * Sử dụng Use Case layer để thực hiện business logic
 */
export const fetchVehicleById = createAsyncThunk(
  "vehicles/fetchById",
  async (vehicleId: string) => {
    try {
      // Gọi use case thay vì gọi repository trực tiếp
      const response = await getVehicleByIdUseCase(
        vehicleRepositoryAPI,
        vehicleId
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
);
