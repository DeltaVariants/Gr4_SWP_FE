/**
 * Vehicle Repository Interface
 * Định nghĩa contract cho vehicle operations
 */

import { Vehicle, CreateVehicleData, UpdateVehicleData } from '../entities/Vehicle';

export interface IVehicleRepository {
  /**
   * Get all vehicles
   */
  getAll(): Promise<Vehicle[]>;

  /**
   * Get vehicle by ID
   */
  getById(id: string): Promise<Vehicle>;

  /**
   * Get vehicles by user
   */
  getByUser(userID: string): Promise<Vehicle[]>;

  /**
   * Get vehicle by license plate
   */
  getByLicensePlate(licensePlate: string): Promise<Vehicle | null>;

  /**
   * Create new vehicle
   */
  create(data: CreateVehicleData): Promise<Vehicle>;

  /**
   * Update vehicle
   */
  update(id: string, data: UpdateVehicleData): Promise<Vehicle>;

  /**
   * Delete vehicle
   */
  delete(id: string): Promise<void>;
}
