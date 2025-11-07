import {
  BatteryUpdateRequest,
  BatteryUpdateResponse,
} from "../entities/BatteryUpdate";

export interface IBatteryUpdateRepository {
  updateBattery(
    batteryID: string,
    data: BatteryUpdateRequest
  ): Promise<BatteryUpdateResponse>;
}
