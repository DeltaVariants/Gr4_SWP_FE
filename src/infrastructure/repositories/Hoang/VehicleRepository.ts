/**
 * Vehicle Repository Implementation
 * Implements IVehicleRepository using API calls
 */

import { IVehicleRepository } from '@/domain/repositories/Hoang/IVehicleRepository';
import { Vehicle, CreateVehicleData, UpdateVehicleData } from '@/domain/dto/Hoang/Vehicle';
import api from '@/lib/api';

export class VehicleRepository implements IVehicleRepository {
  private readonly basePath = '/vehicles';

  async getAll(): Promise<Vehicle[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<Vehicle> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }

  async getByUser(userID: string): Promise<Vehicle[]> {
    const response = await api.get(`${this.basePath}/user/${userID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    try {
      const response = await api.get(`${this.basePath}/search`, {
        params: { licensePlate },
      });
      return response.data.data || response.data || null;
    } catch (error) {
      console.error('[VehicleRepository] Search failed:', error);
      return null;
    }
  }

  async create(data: CreateVehicleData): Promise<Vehicle> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const response = await api.patch(`${this.basePath}/${id}`, data);
    return response.data.data || response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const vehicleRepository = new VehicleRepository();

