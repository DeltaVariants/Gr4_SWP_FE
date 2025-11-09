/**
 * BatteryCondition Repository Implementation
 * Implements IBatteryConditionRepository using API calls
 */

import { IBatteryConditionRepository } from '@/domain/repositories/IBatteryConditionRepository';
import {
  BatteryCondition,
  CreateBatteryConditionData,
  UpdateBatteryConditionData,
} from '@/domain/entities/BatteryCondition';
import api from '@/lib/api';

export class BatteryConditionRepository implements IBatteryConditionRepository {
  private readonly basePath = '/battery-condition-logs';

  async getAll(): Promise<BatteryCondition[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<BatteryCondition> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }

  async getByStation(stationName: string): Promise<BatteryCondition[]> {
    const response = await api.get(`${this.basePath}/${stationName}/battery-condition-logs`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getByBattery(batteryID: string): Promise<BatteryCondition[]> {
    const response = await api.get(`${this.basePath}/battery/${batteryID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async create(data: CreateBatteryConditionData): Promise<BatteryCondition> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async update(id: string, data: UpdateBatteryConditionData): Promise<BatteryCondition> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }
}

// Export singleton instance
export const batteryConditionRepository = new BatteryConditionRepository();
