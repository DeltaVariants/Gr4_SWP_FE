import { combineReducers } from "@reduxjs/toolkit";
import stationReducer from "../slices/stationSlice";
import mapReducer from "../slices/mapSlice";
// Ví dụ: import userReducer from "../slices/userSlice";

const rootReducer = combineReducers({
  // Ví dụ: user: userReducer
  station: stationReducer,
  map: mapReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
