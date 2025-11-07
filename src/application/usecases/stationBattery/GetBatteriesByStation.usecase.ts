import { StationBattery } from "@/domain/entities/StationBattery";
import { IStationBatteryRepository } from "@/domain/repositories/StationBatteryRepository";

export async function getBatteriesByStationUseCase(
  stationBatteryRepository: IStationBatteryRepository,
  stationID: string
): Promise<StationBattery[]> {
  // Validation
  if (!stationID?.trim()) {
    throw new Error("Station ID is required");
  }

  return await stationBatteryRepository.getBatteriesByStation(stationID);
}
