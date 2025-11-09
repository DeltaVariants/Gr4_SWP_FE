/**
 * Battery Domain Entity
 * Định nghĩa entity cho battery
 */

export interface Battery {
  // Frontend standard fields (mapped from backend)
  batteryId: string;           // Mapped from batteryID
  batteryCode: string;         // Mapped from batteryID if not present
  batteryType: string;         // Mapped from batteryTypeName
  status: 'Available' | 'In-Use' | 'Charging' | 'Maintenance' | 'Damaged';  // Mapped from batteryStatus
  stationId: string;           // Mapped from lastStationID
  
  // Legacy fields (for backward compatibility)
  capacity?: number;
  currentCharge?: number;
  stationName?: string;
  lastMaintenance?: string;
  cycleCount?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Backend fields (kept for reference)
  batteryID?: string;          // Backend: Battery unique ID
  batteryTypeID?: string;      // Backend: Battery type GUID
  batteryTypeName?: string;    // Backend: "Small", "Medium", "Large"
  currentLocation?: string;    // Backend: "idle", "in-use", etc.
  batteryStatus?: string;      // Backend: "available", "charging", etc.
  soH?: number;                // Backend: State of Health (0-100)
  currentPercentage?: number;  // Backend: Current charge percentage (0-100)
  lastStationID?: string;      // Backend: Station GUID
}

export interface BatteryInventory {
  total: number;
  available: number;
  inUse: number;
  charging: number;
  maintenance: number;
  damaged: number;
  byType: {
    [key: string]: {
      total: number;
      available: number;
      inUse: number;
      charging: number;
      maintenance: number;
      damaged: number;
    };
  };
}

export interface UpdateBatteryStatusData {
  batteryId: string;
  status: Battery['status'];
  notes?: string;
}
