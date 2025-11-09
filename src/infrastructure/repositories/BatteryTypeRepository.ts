/**
 * BatteryType Repository Implementation
 * Implements IBatteryTypeRepository using API calls
 */

import { IBatteryTypeRepository } from '@/domain/repositories/IBatteryTypeRepository';
import {
  BatteryType,
  CreateBatteryTypeData,
  UpdateBatteryTypeData,
} from '@/domain/entities/BatteryType';
import api from '@/lib/api';

export class BatteryTypeRepository implements IBatteryTypeRepository {
  private readonly basePath = '/battery-types';

  async getAll(): Promise<BatteryType[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getByModelName(modelName: string): Promise<BatteryType> {
    const response = await api.get(`${this.basePath}/${modelName}`);
    return response.data.data || response.data;
  }

  async create(data: CreateBatteryTypeData): Promise<BatteryType> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async update(id: string, data: UpdateBatteryTypeData): Promise<BatteryType> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const batteryTypeRepository = new BatteryTypeRepository();
