/**
 * BatteryTransfer Repository Implementation
 * Implements IBatteryTransferRepository using API calls
 */

import { IBatteryTransferRepository } from '@/domain/repositories/IBatteryTransferRepository';
import {
  BatteryTransfer,
  CreateBatteryTransferData,
  UpdateBatteryTransferData,
} from '@/domain/entities/BatteryTransfer';
import api from '@/lib/api';

export class BatteryTransferRepository implements IBatteryTransferRepository {
  private readonly basePath = '/battery-transfers';

  async getAll(): Promise<BatteryTransfer[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<BatteryTransfer> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }

  async getByStation(stationID: string): Promise<BatteryTransfer[]> {
    const response = await api.get(`${this.basePath}/station/${stationID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async create(data: CreateBatteryTransferData): Promise<BatteryTransfer> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async update(id: string, data: UpdateBatteryTransferData): Promise<BatteryTransfer> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }
}

// Export singleton instance
export const batteryTransferRepository = new BatteryTransferRepository();
