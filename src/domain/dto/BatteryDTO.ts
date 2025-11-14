/**
 * BatteryDTO - Backend Response Format
 * Map trực tiếp từ backend C# BatteryResponse, BatteryViewAll, etc.
 * PascalCase để match với backend response
 */

export interface BatteryResponseDTO {
  BatteryID: string;
  BatteryTypeID?: string;
  BatteryTypeName?: string;
  BatterySlotID?: string | null;
  VehicleID?: string | null;
  LastStationID?: string;
  CurrentLocation?: string;      // "idle", "in-use", etc.
  BatteryStatus?: string | null; // "available", "faulty", null
  SoH?: number;                  // State of Health (0-100)
  CurrentPercentage?: number;    // Current charge (0-100)
  CreatedAt?: string;            // ISO date string
}

export interface BatteryViewAllDTO {
  BatteryID: string;
  SoH?: number;
  CurrentLocationStatus: string;  // "idle", "in-use", etc.
  BatteryStatus?: string | null;
  CurrentPercentage?: number;
  CreatedAt: string;
}

export interface BatteryViewByTypeDTO {
  BatteryID: string;
  BatteryTypeID: string;
  BatteryTypeName: string;
  CurrentLocation: string;
  BatteryStatus?: string | null;
  SoH?: number;
  BatteryModel: string;
  Manufacturer: string;
  Voltage?: number;
  CreatedAt: string;
}

