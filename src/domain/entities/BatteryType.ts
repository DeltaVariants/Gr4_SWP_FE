/**
 * BatteryType Domain Entity
 * Định nghĩa entity cho loại pin
 */

export interface BatteryType {
  batteryTypeID: string;
  modelName: string;
  manufacturer?: string;
  voltage: number; // V
  capacity: number; // Ah
  weight?: number; // kg
  dimensions?: string; // LxWxH
  maxCycles?: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatteryTypeData {
  modelName: string;
  manufacturer?: string;
  voltage: number;
  capacity: number;
  weight?: number;
  dimensions?: string;
  maxCycles?: number;
  description?: string;
}

export interface UpdateBatteryTypeData {
  modelName?: string;
  manufacturer?: string;
  voltage?: number;
  capacity?: number;
  weight?: number;
  dimensions?: string;
  maxCycles?: number;
  description?: string;
  isActive?: boolean;
}
