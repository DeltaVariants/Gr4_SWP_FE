import { Slot } from "@/domain/entities/Slot";
import { createSlice } from "@reduxjs/toolkit";
import { fetchSlotsByStation } from "../services/slotService";

interface SlotState {
  slots: Slot[];
  selectedSlot: Slot | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null;
  currentStationID: string | null;
}

const initialState: SlotState = {
  slots: [],
  selectedSlot: null,
  loading: false,
  error: null,
  lastFetched: null,
  pagination: null,
  currentStationID: null,
};

const slotSlice = createSlice({
  name: "slot",
  initialState,
  reducers: {
    clearSelectedSlot(state) {
      state.selectedSlot = null;
    },
    invalidateSlotsCache(state) {
      state.lastFetched = null;
    },
    clearSlots(state) {
      state.slots = [];
      state.pagination = null;
      state.currentStationID = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSlotsByStation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlotsByStation.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload.data;
        state.pagination = action.payload.pagination;
        state.lastFetched = Date.now();
        // Extract stationID from the first slot if available
        if (action.payload.data.length > 0) {
          state.currentStationID = action.payload.data[0].stationID;
        }
      })
      .addCase(fetchSlotsByStation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch slots";
      });
  },
});

export const { clearSelectedSlot, invalidateSlotsCache, clearSlots } =
  slotSlice.actions;
export default slotSlice.reducer;
