import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice";
import mapReducer from "./slices/mapSlice";
import stationReducer from "./slices/stationSlice";
import batteryReducer from "./slices/batterySlice";
import slotReducer from "./slices/slotSlice";
import stationBatteryReducer from "./slices/stationBatterySlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    map: mapReducer,
    station: stationReducer,
    battery: batteryReducer,
    slot: slotReducer,
    stationBattery: stationBatteryReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
