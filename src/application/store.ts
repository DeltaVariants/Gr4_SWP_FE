import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Thêm các slice khác tại đây
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
