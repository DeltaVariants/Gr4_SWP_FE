import { Vehicle } from "@/domain/entities/Vehicle";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAllVehicles, fetchVehicleById } from "../services/vehicleService";
import {
  selectVehicleUseCase,
  getLastSelectedVehicleIdUseCase,
} from "../usecases/vehicle/SelectVehicle.usecase";

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // timestamp of last successful fetch
}

const initialState: VehicleState = {
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  error: null,
  lastFetched: null,
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    // Action đồng bộ - sử dụng use case
    clearSelectedVehicle(state) {
      // Sử dụng use case để clear selection
      selectVehicleUseCase(null);
      state.selectedVehicle = null;
    },
    invalidateVehiclesCache(state) {
      state.lastFetched = null;
    },
    setSelectedVehicle(state, action: PayloadAction<Vehicle>) {
      // Sử dụng use case để lưu selection
      selectVehicleUseCase(action.payload);
      state.selectedVehicle = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Xử lý action bất đồng bộ ở đây
    builder
      // fetchAllVehicles
      .addCase(fetchAllVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
        state.lastFetched = Date.now();

        // Tự động chọn xe đầu tiên nếu chưa có xe được chọn
        if (action.payload.length > 0 && !state.selectedVehicle) {
          // Kiểm tra xem có xe nào đã được chọn trước đó không (từ localStorage)
          const lastSelectedId = getLastSelectedVehicleIdUseCase();
          const previouslySelected = lastSelectedId
            ? action.payload.find((v) => v.vehicleID === lastSelectedId)
            : null;

          // Ưu tiên xe đã chọn trước đó, không thì chọn xe đầu tiên
          const vehicleToSelect = previouslySelected || action.payload[0];
          selectVehicleUseCase(vehicleToSelect);
          state.selectedVehicle = vehicleToSelect;
        }
      })
      .addCase(fetchAllVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch vehicles";
      })
      // fetchVehicleById
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.selectedVehicle = action.payload;
        }
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch vehicle";
      });
  },
});

export const {
  clearSelectedVehicle,
  invalidateVehiclesCache,
  setSelectedVehicle,
} = vehicleSlice.actions;
export default vehicleSlice.reducer;
