import { batteryRepositoryAPI } from "@/infrastructure/repositories/BatteryRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetBatteriesParams } from "@/domain/repositories/BatteryRepository";

export const fetchAllBatteries = createAsyncThunk(
  "batteries/fetchAll",
  async (params?: GetBatteriesParams) => {
    try {
      const response = await batteryRepositoryAPI.getAll(params);
      return response;
    } catch (error) {
      throw error;
    }
  }
);
