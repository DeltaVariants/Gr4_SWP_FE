/**
 * BatteryCondition Domain Entity
 * Định nghĩa entity cho điều kiện/tình trạng pin
 */

export interface BatteryCondition {
  batteryConditionID: string;
  batteryID: string;
  batteryCode?: string;
  stationID: string;
  stationName?: string;
  checkDate: string;
  stateOfHealth: number; // SOH %
  stateOfCharge: number; // SOC %
  temperature?: number; // Celsius
  voltage?: number; // V
  cycleCount?: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  notes?: string;
  checkedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatteryConditionData {
  batteryID: string;
  stationID: string;
  stateOfHealth: number;
  stateOfCharge: number;
  temperature?: number;
  voltage?: number;
  cycleCount?: number;
  condition: BatteryCondition['condition'];
  notes?: string;
}

export interface UpdateBatteryConditionData {
  stateOfHealth?: number;
  stateOfCharge?: number;
  temperature?: number;
  voltage?: number;
  cycleCount?: number;
  condition?: BatteryCondition['condition'];
  notes?: string;
}
