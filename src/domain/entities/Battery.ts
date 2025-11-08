export interface Battery {
  batteryID: string;
  soH: number; // State of Health
  currentLocationStatus: string; // "idle", "in-use", etc.
  batteryStatus: string | null; // "available", "faulty", null
  currentPercentage: number;
  createdAt: string; // ISO 8601 date-time string
}

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
