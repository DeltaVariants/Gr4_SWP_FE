import { BatteryType } from "@/domain/entities/BatteryType";
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllBatteryTypes } from "../services/batteryTypeService";

interface BatteryTypeState {
  batteryTypes: BatteryType[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp of last successful fetch
}

const initialState: BatteryTypeState = {
  batteryTypes: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const batteryTypeSlice = createSlice({
  name: "batteryType",
  initialState,
  reducers: {
    invalidateBatteryTypesCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllBatteryTypes
      .addCase(fetchAllBatteryTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBatteryTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.batteryTypes = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllBatteryTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch battery types";
      });
  },
});

export const { invalidateBatteryTypesCache } = batteryTypeSlice.actions;
export default batteryTypeSlice.reducer;
