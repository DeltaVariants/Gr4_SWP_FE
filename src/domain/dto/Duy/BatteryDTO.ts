/**
 * Battery DTO - Phản ánh response từ API
 * Dùng cho client sử dụng, có tên field theo convention camelCase
 */
export interface BatteryDTO {
  batteryID: string;
  batteryTypeID: string;
  lastStationID: string;
  capacityKWh: number;
  position: "in_vehicle" | "at_station_idle" | "in_transit";
  status: "charging" | "available" | "faulty" | null;
  soH: number; // State of Health
  percentage: number;
  currentSlotID?: string;
  currentVehicleID?: string;
}

/**
 * Battery List Response DTO
 */
export interface BatteryListResponse {
  success: boolean;
  message: string;
  data: BatteryDTO[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Battery Detail Response DTO
 */
export interface BatteryDetailResponse {
  success: boolean;
  message: string;
  data: BatteryDTO;
}

/**
 * Update Battery Request DTO (API Request - simple)
 */
export interface UpdateBatteryParams {
  batteryID: string;
  batterySlotID?: string;
  currentPercentage?: number;
}

/**
 * Update Battery Request DTO (Advanced)
 */
export interface UpdateBatteryRequest {
  batteryID: string;
  currentSlotID?: string;
  currentVehicleID?: string;
  percentage?: number;
  status?: "charging" | "available" | "faulty" | null;
  position?: "in_vehicle" | "at_station_idle" | "in_transit";
}

/**
 * Update Battery Response DTO
 */
export interface UpdateBatteryResponse {
  success: boolean;
  message: string;
  data?: BatteryDTO;
}

/**
 * Create Battery Request DTO
 */
export interface CreateBatteryRequest {
  batteryTypeID: string;
  capacityKWh: number;
  lastStationID: string;
  position: "in_vehicle" | "at_station_idle" | "in_transit";
  soH: number;
}
