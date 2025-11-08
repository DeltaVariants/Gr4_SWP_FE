import { batteryRepositoryAPI } from "@/infrastructure/repositories/BatteryRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetBatteriesParams } from "@/domain/repositories/BatteryRepository";
import { updateBatteryPercentageUseCase } from "../usecases/battery/UpdateBatteryPercentage.usecase";
import { removeBatteryFromSlotUseCase } from "../usecases/battery/RemoveBatteryFromSlot.usecase";
import { assignBatteryToSlotUseCase } from "../usecases/battery/AssignBatteryToSlot.usecase";

export const fetchAllBatteries = createAsyncThunk(
  "batteries/fetchAll",
  async (params?: GetBatteriesParams) => {
    try {
      const response = await batteryRepositoryAPI.getAll(params);
      return response;
    } catch (error) {
      throw error;
    }
  }
);

/**
 * Redux Thunk: Gắn pin vào slot
 */
export const assignBatteryToSlot = createAsyncThunk(
  "batteries/assignToSlot",
  async ({
    batteryID,
    batterySlotID,
    currentPercentage,
  }: {
    batteryID: string;
    batterySlotID: string;
    currentPercentage: number;
  }) => {
    try {
      const response = await assignBatteryToSlotUseCase(
        batteryRepositoryAPI,
        batteryID,
        batterySlotID,
        currentPercentage
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
);

/**
 * Redux Thunk: Update phần trăm pin
 */
export const updateBatteryPercentage = createAsyncThunk(
  "batteries/updatePercentage",
  async ({
    batteryID,
    currentPercentage,
  }: {
    batteryID: string;
    currentPercentage: number;
  }) => {
    try {
      const response = await updateBatteryPercentageUseCase(
        batteryRepositoryAPI,
        batteryID,
        currentPercentage
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
);

/**
 * Redux Thunk: Tháo pin ra khỏi slot
 */
export const removeBatteryFromSlot = createAsyncThunk(
  "batteries/removeFromSlot",
  async (batteryID: string) => {
    try {
      const response = await removeBatteryFromSlotUseCase(
        batteryRepositoryAPI,
        batteryID
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
);
