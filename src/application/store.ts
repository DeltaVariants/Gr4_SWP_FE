import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice";
import mapReducer from "./slices/mapSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    map: mapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
