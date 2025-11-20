export interface BatteryType {
  batteryTypeID: string;
  batteryTypeModel: string;
  batteryTypeCapacity: number;
  voltage: number;
  manufacturer: string;
}

export interface BatteryTypeListResponse {
  success: boolean;
  message: string;
  data: BatteryType[];
}
