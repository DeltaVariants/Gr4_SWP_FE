import { StationBattery } from "../entities/StationBattery";

export interface BatteryQueryParams {
  pageNumber?: number;
  pageSize?: number;
  createDate?: string;
  typeName?: string;
  vehicleId?: string;
  batteryID?: string;
}

export interface IStationBatteryRepository {
  /**
   * Lấy danh sách pin của một station
   */
  getBatteriesByStation(
    stationID: string,
    params?: BatteryQueryParams
  ): Promise<StationBattery[]>;
}
