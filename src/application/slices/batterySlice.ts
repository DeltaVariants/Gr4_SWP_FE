import { Battery } from "@/domain/entities/Battery";
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllBatteries } from "../services/batteryService";

interface BatteryState {
  batteries: Battery[];
  selectedBattery: Battery | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp of last successful fetch
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null;
}

const initialState: BatteryState = {
  batteries: [],
  selectedBattery: null,
  loading: false,
  error: null,
  lastFetched: null,
  pagination: null,
};

const batterySlice = createSlice({
  name: "battery",
  initialState,
  reducers: {
    // Action đồng bộ
    clearSelectedBattery(state) {
      state.selectedBattery = null;
    },
    invalidateBatteriesCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    // Xử lý action bất đồng bộ ở đây
    builder
      // fetchAllBatteries
      .addCase(fetchAllBatteries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBatteries.fulfilled, (state, action) => {
        state.loading = false;
        state.batteries = action.payload.data;
        state.pagination = action.payload.pagination;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllBatteries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch batteries";
      });
  },
});

export const { clearSelectedBattery, invalidateBatteriesCache } =
  batterySlice.actions;
export default batterySlice.reducer;
