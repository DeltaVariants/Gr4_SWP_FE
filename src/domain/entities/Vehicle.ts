/**
 * Vehicle Domain Entity
 * Định nghĩa entity cho phương tiện
 */

export interface Vehicle {
  vehicleID: string;
  userID: string;
  userName?: string;
  licensePlate: string;
  vehicleModel: string;
  vehicleType: string;
  batteryTypeID?: string;
  batteryTypeName?: string;
  color?: string;
  year?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleData {
  userID: string;
  licensePlate: string;
  vehicleModel: string;
  vehicleType: string;
  batteryTypeID?: string;
  color?: string;
  year?: number;
}

export interface UpdateVehicleData {
  licensePlate?: string;
  vehicleModel?: string;
  vehicleType?: string;
  batteryTypeID?: string;
  color?: string;
  year?: number;
  isActive?: boolean;
}
