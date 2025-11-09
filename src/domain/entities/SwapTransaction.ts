/**
 * SwapTransaction Domain Entity
 * Định nghĩa entity cho giao dịch hoán đổi pin
 */

export interface SwapTransaction {
  swapTransactionID: string;
  userID: string;
  userName?: string;
  vehicleID: string;
  vehiclePlate?: string;
  stationID: string;
  stationName?: string;
  bookingID?: string;
  oldBatteryID: string;
  oldBatteryCode?: string;
  newBatteryID: string;
  newBatteryCode?: string;
  swapDate: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  subscriptionPlanID?: string;
  subscriptionPlanName?: string;
  employeeID?: string;
  employeeName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSwapTransactionData {
  userID: string;
  vehicleID: string;
  stationID: string;
  bookingID?: string;
  oldBatteryID: string;
  newBatteryID: string;
  amount: number;
  subscriptionPlanID?: string;
  notes?: string;
}

export interface CompleteSwapTransactionData {
  oldBatteryID: string;
  newBatteryID: string;
  amount: number;
  paymentStatus: 'Paid' | 'Failed';
  notes?: string;
}
