import { stationBatteryRepositoryAPI } from "@/infrastructure/repositories/StationBatteryRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { BatteryQueryParams } from "@/domain/repositories/StationBatteryRepository";

interface FetchBatteriesParams {
  stationID: string;
  queryParams?: BatteryQueryParams;
}

export const fetchBatteriesByStation = createAsyncThunk(
  "stationBatteries/fetchByStation",
  async ({ stationID, queryParams }: FetchBatteriesParams) => {
    try {
      const response = await stationBatteryRepositoryAPI.getBatteriesByStation(
        stationID,
        queryParams
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
);
