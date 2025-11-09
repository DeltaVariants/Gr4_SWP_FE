/**
 * Booking Domain Entity
 * Định nghĩa entity cho booking/reservation
 */

export interface Booking {
  bookingID: string;
  customerName: string;
  customerId?: string;
  vehicleId: string;
  batteryType: string;
  bookingTime: string;
  bookingStatus: 'Pending' | 'Booked' | 'Queue' | 'Checked' | 'Completed' | 'Cancelled';
  stationId: string;
  stationName?: string;
  queueNumber?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckInData {
  bookingId: string;
  vehicleId: string;
  notes?: string;
}

export interface SwapData {
  bookingId: string;
  oldBatteryId: string;
  newBatteryId: string;
  notes?: string;
}

export interface CreateBookingData {
  customerId: string;
  customerName: string;
  stationId: string;
  vehicleId: string;
  batteryType: string;
  bookingTime: string;
}
