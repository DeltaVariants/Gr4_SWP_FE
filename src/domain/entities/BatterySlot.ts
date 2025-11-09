/**
 * BatterySlot Domain Entity
 * Định nghĩa entity cho khe pin tại trạm
 */

export interface BatterySlot {
  batterySlotID: string;
  stationID: string;
  stationName?: string;
  slotNumber: number;
  batteryID?: string;
  batteryCode?: string;
  status: 'Empty' | 'Occupied' | 'Charging' | 'Maintenance' | 'Error';
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatterySlotData {
  stationID: string;
  slotNumber: number;
  batteryID?: string;
}

export interface UpdateBatterySlotData {
  batteryID?: string;
  status?: BatterySlot['status'];
}
