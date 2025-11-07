import { IBatteryUpdateRepository } from "@/domain/repositories/BatteryUpdateRepository";
import {
  BatteryUpdateRequest,
  BatteryUpdateResponse,
} from "@/domain/entities/BatteryUpdate";

export class UpdateBatteryUseCase {
  constructor(private batteryUpdateRepository: IBatteryUpdateRepository) {}

  async execute(
    batteryID: string,
    data: BatteryUpdateRequest
  ): Promise<BatteryUpdateResponse> {
    return await this.batteryUpdateRepository.updateBattery(batteryID, data);
  }
}
