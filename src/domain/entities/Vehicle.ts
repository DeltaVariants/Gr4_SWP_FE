export interface Vehicle {
  vehicleID: string;
  vehicleName: string;
  category: string;
  vin: string;
  licensePlate: string;
  modelYear: string;
  color: string;
  batteryTypeID: string;
  batteryTypeModel: string | null;
  userID: string;
  status: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
}
