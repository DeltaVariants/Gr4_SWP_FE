/**
 * BatteryCondition Domain Entity
 * Định nghĩa entity cho điều kiện/tình trạng pin
 * Maps to backend BatteryConditionLogDTOs
 */

export interface BatteryCondition {
  LogID?: string; // Backend field name
  batteryConditionID?: string; // Alias for LogID
  batteryID: string;
  batteryCode?: string;
  stationID?: string;
  stationName?: string;
  checkDate?: string; // Alias for ReportDate
  ReportDate?: string; // Backend field name (DateOnly)
  stateOfHealth?: number; // SOH % - not in backend DTO
  stateOfCharge?: number; // SOC % - not in backend DTO
  temperature?: number; // Celsius - not in backend DTO
  voltage?: number; // V - not in backend DTO
  cycleCount?: number; // not in backend DTO
  condition?: string; // Backend field name
  Condition?: string; // Backend field name (capitalized)
  notes?: string; // Alias for Description
  Description?: string; // Backend field name
  checkedBy?: string; // Alias for UserName
  UserName?: string; // Backend field name
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatteryConditionData {
  batteryID: string;
  stationID?: string; // Optional, backend gets from user claim
  stateOfHealth?: number; // Not in backend DTO
  stateOfCharge?: number; // Not in backend DTO
  temperature?: number; // Not in backend DTO
  voltage?: number; // Not in backend DTO
  cycleCount?: number; // Not in backend DTO
  condition?: string; // Maps to backend Condition
  Condition?: string; // Backend field name
  notes?: string; // Maps to backend Description
  Description?: string; // Backend field name
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
