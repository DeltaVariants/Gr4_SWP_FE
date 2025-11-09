/**
 * BatteryTransfer Domain Entity
 * Định nghĩa entity cho chuyển pin giữa các trạm
 */

export interface BatteryTransfer {
  batteryTransferID: string;
  batteryID: string;
  batteryCode?: string;
  fromStationID: string;
  fromStationName?: string;
  toStationID: string;
  toStationName?: string;
  transferDate: string;
  status: 'Pending' | 'In-Transit' | 'Completed' | 'Cancelled';
  requestedBy?: string;
  approvedBy?: string;
  completedBy?: string;
  reason?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatteryTransferData {
  batteryID: string;
  fromStationID: string;
  toStationID: string;
  reason?: string;
  notes?: string;
}

export interface UpdateBatteryTransferData {
  status: BatteryTransfer['status'];
  notes?: string;
}
