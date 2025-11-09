import { IBatteryRepository } from '@/domain/repositories/IBatteryRepository';
import { UpdateBatteryStatusData } from '@/domain/entities/Battery';

export class UpdateBatteryStatusUseCase {
  constructor(private batteryRepository: IBatteryRepository) {}

  async execute(data: UpdateBatteryStatusData): Promise<void> {
    if (!data.batteryId) {
      throw new Error('Battery ID is required');
    }
    if (!data.status) {
      throw new Error('Status is required');
    }

    try {
      await this.batteryRepository.updateStatus(data);
    } catch (error: any) {
      console.error('[UpdateBatteryStatusUseCase] Error:', error);
      throw new Error(error?.message || 'Failed to update battery status');
    }
  }
}
