import { SlotListResponse } from "@/domain/entities/Slot";
import {
  ISlotRepository,
  GetSlotsParams,
} from "@/domain/repositories/SlotRepository";

export async function getSlotsByStationUseCase(
  slotRepository: ISlotRepository,
  params: GetSlotsParams
): Promise<SlotListResponse> {
  // Validation
  if (!params.stationID?.trim()) {
    throw new Error("Station ID is required");
  }

  return await slotRepository.getSlotsByStation(params);
}
