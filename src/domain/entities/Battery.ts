/**
 * Battery Entity - Phản ánh cấu trúc database
 * Chứa tất cả các trường từ bảng Battery trong database
 */
export interface Battery {
  battery_id: string; // PK
  battery_type_id: string; // FK
  last_station_id: string; // FK
  capacity_kWh: number;
  position: "in_vehicle" | "at_station_idle" | "in_transit";
  status: "charging" | "available" | "faulty" | null;
  SoH: number; // State of Health
  percentage: number;
  current_slot_id?: string; // FK (optional)
  current_vehicle_id?: string; // FK (optional)
}

/**
 * Utility function to get battery type from batteryID
 * Based on battery_type_id
 */
export const getBatteryTypeFromId = (batteryTypeId: string): string => {
  if (!batteryTypeId || typeof batteryTypeId !== 'string') {
    return "Unknown";
  }
  const prefix = batteryTypeId.substring(0, 3).toUpperCase();

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
