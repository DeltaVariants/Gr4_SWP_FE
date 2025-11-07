export interface BatteryUpdateRequest {
  batterySlotID: string;
  vehicleID: string | null;
  currentPercentage: number;
}

export interface BatteryUpdateResponse {
  message: string;
}
