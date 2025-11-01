import { stationRepositoryAPI } from "@/infrastructure/repositories/StationRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAllStations = createAsyncThunk(
  "stations/fetchAll",
  async () => {
    try {
      const stations = await stationRepositoryAPI.getAll();
      return stations;
    } catch (error) {
      throw error;
    }
  }
);
