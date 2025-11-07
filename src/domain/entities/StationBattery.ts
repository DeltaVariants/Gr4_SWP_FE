export interface StationBattery {
  lastStationID: string;
  batteryID: string;
  batteryTypeID: string;
  batteryTypeName: string;
  currentLocation: string;
  batteryStatus: string;
  soH: number;
  currentPercentage: number;
}
