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
    const logs = Array.isArray(data) ? data : [];
    // Map backend DTO to frontend entity format
    return logs.map((log: any) => ({
      LogID: log.LogID,
      batteryConditionID: log.LogID,
      batteryID: log.BatteryID,
      stationName: log.StationName,
      checkDate: log.ReportDate ? new Date(log.ReportDate).toISOString() : undefined,
      ReportDate: log.ReportDate,
      condition: log.Condition,
      Condition: log.Condition,
      notes: log.Description,
      Description: log.Description,
      checkedBy: log.UserName,
      UserName: log.UserName,
    }));
  }

  async getByBattery(batteryID: string): Promise<BatteryCondition[]> {
    const response = await api.get(`${this.basePath}/battery/${batteryID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async create(data: CreateBatteryConditionData): Promise<BatteryCondition> {
    // Map frontend data to backend DTO format
    const backendData = {
      BatteryID: data.batteryID,
      Condition: data.Condition || data.condition,
      Description: data.Description || data.notes,
    };
    const response = await api.post(this.basePath, backendData);
    const result = response.data.data || response.data;
    // Map backend response to frontend entity format
    return {
      LogID: result.LogID,
      batteryConditionID: result.LogID,
      batteryID: result.BatteryID,
      stationName: result.StationName,
      checkDate: result.ReportDate ? new Date(result.ReportDate).toISOString() : undefined,
      ReportDate: result.ReportDate,
      condition: result.Condition,
      Condition: result.Condition,
      notes: result.Description,
      Description: result.Description,
      checkedBy: result.UserName,
      UserName: result.UserName,
    };
  }

  async update(id: string, data: UpdateBatteryConditionData): Promise<BatteryCondition> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }
}

// Export singleton instance
export const batteryConditionRepository = new BatteryConditionRepository();
