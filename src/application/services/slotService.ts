import { slotRepositoryAPI } from "@/infrastructure/repositories/SlotRepositoryAPI.impl";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetSlotsParams } from "@/domain/repositories/SlotRepository";

export const fetchSlotsByStation = createAsyncThunk(
  "slots/fetchByStation",
  async (params: GetSlotsParams) => {
    try {
      const response = await slotRepositoryAPI.getSlotsByStation(params);
      return response;
    } catch (error) {
      throw error;
    }
  }
);
