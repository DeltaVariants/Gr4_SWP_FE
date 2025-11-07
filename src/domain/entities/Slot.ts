export interface Slot {
  batterySlotID: string;
  batteryID: string | null;
  stationID: string;
  status: string; // "Empty", "Occupied", "Charging", etc.
  currentPercentage?: number; // Battery charge percentage if occupied
}

export interface SlotListResponse {
  success: boolean;
  message: string;
  data: Slot[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
