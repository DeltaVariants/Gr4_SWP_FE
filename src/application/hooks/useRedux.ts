import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";

// Sử dụng trong component để lấy dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
// Sử dụng trong component để lấy state
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
