import { batteryTypeRepositoryAPI } from "@/infrastructure/repositories/BatteryTypeRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllBatteryTypesUseCase } from "../usecases/batteryType/GetAllBatteryTypes.usecase";

/**
 * Redux Thunk: Fetch tất cả battery types
 * Sử dụng Use Case layer để thực hiện business logic
 */
export const fetchAllBatteryTypes = createAsyncThunk(
  "batteryTypes/fetchAll",
  async () => {
    try {
      const response = await getAllBatteryTypesUseCase(
        batteryTypeRepositoryAPI
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
);
