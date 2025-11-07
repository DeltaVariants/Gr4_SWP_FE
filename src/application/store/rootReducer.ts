import { combineReducers } from "@reduxjs/toolkit";
import stationReducer from "../slices/stationSlice";
import mapReducer from "../slices/mapSlice";
import batteryReducer from "../slices/batterySlice";
import userReducer from "../slices/userSlice";

const rootReducer = combineReducers({
  station: stationReducer,
  map: mapReducer,
  battery: batteryReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
