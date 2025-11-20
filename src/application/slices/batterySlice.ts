import { BatteryDTO } from "@/dto";
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllBatteries,
  assignBatteryToSlot,
  updateBatteryPercentage,
  removeBatteryFromSlot,
} from "../services/batteryService";

interface BatteryState {
  batteries: BatteryDTO[];
  selectedBattery: BatteryDTO | null;
  loading: boolean;
  updating: boolean; // Loading state cho update operations
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
  updating: false,
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
      })
      // assignBatteryToSlot
      .addCase(assignBatteryToSlot.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(assignBatteryToSlot.fulfilled, (state) => {
        state.updating = false;
        // Invalidate cache để fetch lại danh sách pin
        state.lastFetched = null;
      })
      .addCase(assignBatteryToSlot.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.error.message || "Failed to assign battery to slot";
      })
      // updateBatteryPercentage
      .addCase(updateBatteryPercentage.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBatteryPercentage.fulfilled, (state) => {
        state.updating = false;
        // Invalidate cache để fetch lại danh sách pin
        state.lastFetched = null;
      })
      .addCase(updateBatteryPercentage.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.error.message || "Failed to update battery percentage";
      })
      // removeBatteryFromSlot
      .addCase(removeBatteryFromSlot.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(removeBatteryFromSlot.fulfilled, (state) => {
        state.updating = false;
        // Invalidate cache để fetch lại danh sách pin
        state.lastFetched = null;
      })
      .addCase(removeBatteryFromSlot.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.error.message || "Failed to remove battery from slot";
      });
  },
});

export const { clearSelectedBattery, invalidateBatteriesCache } =
  batterySlice.actions;
export default batterySlice.reducer;
