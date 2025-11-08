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

/**
 * Utility function to get battery type from batteryID
 * Based on first 3 characters:
 * LAR = "Large"
 * MED = "Medium"
 * SMA = "Small"
 */
export const getBatteryTypeFromId = (batteryID: string): string => {
  const prefix = batteryID.substring(0, 3).toUpperCase();

  switch (prefix) {
    case "LAR":
      return "Large";
    case "MED":
      return "Medium";
    case "SMA":
      return "Small";
    default:
      return "Unknown";
  }
};
