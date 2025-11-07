import { StationBattery } from "../entities/StationBattery";

export interface IStationBatteryRepository {
  /**
   * Lấy danh sách pin của một station
   */
  getBatteriesByStation(stationID: string): Promise<StationBattery[]>;
}
