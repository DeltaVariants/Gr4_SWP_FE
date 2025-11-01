import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
  center: [number, number];
  zoom: number;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

const initialState: MapState = {
  center: [10.762622, 106.660172], // Default: Ho Chi Minh City
  zoom: 15,
  userLocation: null,
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMapCenter: (state, action: PayloadAction<[number, number]>) => {
      state.center = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setUserLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number } | null>
    ) => {
      state.userLocation = action.payload;
    },
    setMapView: (
      state,
      action: PayloadAction<{ center: [number, number]; zoom: number }>
    ) => {
      state.center = action.payload.center;
      state.zoom = action.payload.zoom;
    },
  },
});

export const { setMapCenter, setMapZoom, setUserLocation, setMapView } =
  mapSlice.actions;
export default mapSlice.reducer;
