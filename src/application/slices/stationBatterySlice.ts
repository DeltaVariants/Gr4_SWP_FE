import { StationBattery } from "@/domain/entities/StationBattery";
import { createSlice } from "@reduxjs/toolkit";
import { fetchBatteriesByStation } from "../services/stationBatteryService";

interface StationBatteryState {
  batteries: StationBattery[];
  selectedBattery: StationBattery | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  currentStationID: string | null;
}

const initialState: StationBatteryState = {
  batteries: [],
  selectedBattery: null,
  loading: false,
  error: null,
  lastFetched: null,
  currentStationID: null,
};

const stationBatterySlice = createSlice({
  name: "stationBattery",
  initialState,
  reducers: {
    clearSelectedBattery(state) {
      state.selectedBattery = null;
    },
    invalidateBatteriesCache(state) {
      state.lastFetched = null;
    },
    clearBatteries(state) {
      state.batteries = [];
      state.currentStationID = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatteriesByStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatteriesByStation.fulfilled, (state, action) => {
        state.loading = false;
        state.batteries = action.payload;
        state.lastFetched = Date.now();
        // Extract stationID from the first battery if available
        if (action.payload.length > 0) {
          state.currentStationID = action.payload[0].lastStationID;
        }
      })
      .addCase(fetchBatteriesByStation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch station batteries";
      });
  },
});

export const {
  clearSelectedBattery,
  invalidateBatteriesCache,
  clearBatteries,
} = stationBatterySlice.actions;
export default stationBatterySlice.reducer;
