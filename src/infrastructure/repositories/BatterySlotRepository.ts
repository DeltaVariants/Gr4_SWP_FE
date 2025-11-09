/**
 * BatterySlot Repository Implementation
 * Implements IBatterySlotRepository using API calls
 */

import { IBatterySlotRepository } from '@/domain/repositories/IBatterySlotRepository';
import {
  BatterySlot,
  CreateBatterySlotData,
  UpdateBatterySlotData,
} from '@/domain/entities/BatterySlot';
import api from '@/lib/api';

export class BatterySlotRepository implements IBatterySlotRepository {
  private readonly basePath = '/battery-slots';

  async getById(id: string): Promise<BatterySlot> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }

  async getByStation(stationID: string): Promise<BatterySlot[]> {
    const response = await api.get(`${this.basePath}/${stationID}/battery-slots`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async create(data: CreateBatterySlotData): Promise<BatterySlot> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async update(id: string, data: UpdateBatterySlotData): Promise<BatterySlot> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const batterySlotRepository = new BatterySlotRepository();
