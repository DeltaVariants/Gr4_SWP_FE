export interface Battery {
  batteryID: string;
  soH: number; // State of Health
  currentLocationStatus: string; // "idle", "in-use", etc.
  batteryStatus: string | null; // "available", "faulty", null
  currentPercentage: number;
  createdAt: string; // ISO 8601 date-time string
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

export interface BatteryListResponse {
  success: boolean;
  message: string;
  data: Battery[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UpdateBatteryParams {
  batteryID: string;
  batterySlotID?: string;
  currentPercentage?: number;
}

export interface UpdateBatteryResponse {
  success: boolean;
  message: string;
  data?: Battery;
}
