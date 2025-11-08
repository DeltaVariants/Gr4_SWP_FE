export interface StationBattery {
  lastStationID: string;
  batteryID: string;
  batteryTypeID: string;
  batteryTypeName: string;
  currentLocation: string;
  batteryStatus: string;
  batterySlotID: string | null; // null = chưa gắn vào slot nào
  soH: number;
  currentPercentage: number;
}
