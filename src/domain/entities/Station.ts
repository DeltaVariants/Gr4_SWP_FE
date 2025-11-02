export interface Station {
  stationID: string;
  stationName: string;
  stationLocation: string;
  slotNumber: number;
  stationCapacity: number;
  batteryOutSlots: number;
  batteryInSlots: number;
  latitude: number;
  longitude: number;
}
