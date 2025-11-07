import { stationBatteryRepositoryAPI } from "@/infrastructure/repositories/StationBatteryRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBatteriesByStation = createAsyncThunk(
  "stationBatteries/fetchByStation",
  async (stationID: string) => {
    try {
      const response = await stationBatteryRepositoryAPI.getBatteriesByStation(
        stationID
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
);
