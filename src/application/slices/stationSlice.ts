import { Station } from "@/domain/entities/Station";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAllStations } from "../services/stationService";
interface StationState {
  stations: Station[];
  selectedStation: Station | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp of last successful fetch
}
const initialState: StationState = {
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,
  lastFetched: null,
};
const stationSlice = createSlice({
  name: "station",
  initialState,
  reducers: {
    //action đồng bộ
    clearSelectedStation(state) {
      state.selectedStation = null;
    },
    invalidateStationsCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    //xử lí action bất đồng bộ ở đây
    builder
      //fetchAllStations
      .addCase(fetchAllStations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllStations.fulfilled,
        (state, action: PayloadAction<Station[]>) => {
          state.loading = false;
          state.stations = action.payload;
          state.lastFetched = Date.now();
        }
      )
      .addCase(fetchAllStations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch stations";
      });
  },
});
export const { clearSelectedStation, invalidateStationsCache } =
  stationSlice.actions;
export default stationSlice.reducer;
