import { createAsyncThunk } from "@reduxjs/toolkit";
import { BatteryUpdateRepositoryAPIImpl } from "@/infrastructure/repositories/BatteryUpdateRepositoryAPI.impl";
import { UpdateBatteryUseCase } from "@/application/usecases/battery/UpdateBattery.usecase";
import { BatteryUpdateRequest } from "@/domain/entities/BatteryUpdate";

const batteryUpdateRepository = new BatteryUpdateRepositoryAPIImpl();
const updateBatteryUseCase = new UpdateBatteryUseCase(batteryUpdateRepository);

interface UpdateBatteryPayload {
  batteryID: string;
  data: BatteryUpdateRequest;
}

export const updateBattery = createAsyncThunk(
  "battery/updateBattery",
  async (payload: UpdateBatteryPayload, { rejectWithValue }) => {
    try {
      const response = await updateBatteryUseCase.execute(
        payload.batteryID,
        payload.data
      );
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update battery";
      return rejectWithValue(message);
    }
  }
);
