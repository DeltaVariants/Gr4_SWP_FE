/**
 * BatteryTransfer Repository Implementation
 * Implements IBatteryTransferRepository using API calls
 */

import { IBatteryTransferRepository } from '@/domain/repositories/Hoang/IBatteryTransferRepository';
import {
  BatteryTransfer,
  CreateBatteryTransferData,
  UpdateBatteryTransferData,
} from '@/domain/dto/Hoang/BatteryTransfer';
import api from '@/lib/api';

export class BatteryTransferRepository implements IBatteryTransferRepository {
  private readonly basePath = '/battery-transfers';

  async getAll(): Promise<BatteryTransfer[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<BatteryTransfer> {
    const response = await api.get(`${this.basePath}/${id}`);
    const data = response.data.data || response.data;
    // Map backend DTO to frontend entity format
    return {
      batteryTransferID: data.TransferID || data.batteryTransferID || id,
      batteryID: data.BatteryID || data.batteryID || '',
      fromStationID: data.FromStationID || data.fromStationID || '',
      toStationID: data.ToStationID || data.toStationID || '',
      transferDate: data.TransferDate ? new Date(data.TransferDate).toISOString() : (data.transferDate || ''),
      status: this.mapStatus(data.TransferStatus || data.status),
    };
  }
  
  private mapStatus(status?: string): BatteryTransfer['status'] {
    if (!status) return 'Pending';
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'in-transit' || statusLower === 'intransit' || statusLower === 'in_transit') return 'In-Transit';
    if (statusLower === 'completed' || statusLower === 'delivered') return 'Completed';
    if (statusLower === 'cancelled') return 'Cancelled';
    return 'Pending';
  }

  async getByStation(stationID: string): Promise<BatteryTransfer[]> {
    const response = await api.get(`${this.basePath}/station/${stationID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async create(data: CreateBatteryTransferData): Promise<BatteryTransfer> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async update(id: string, data: UpdateBatteryTransferData): Promise<BatteryTransfer> {
    // Backend API: PATCH /api/battery-transfers/{id}?status={status}
    // Backend không nhận body, chỉ nhận query parameter status
    // Map frontend status to backend format
    const backendStatus = this.mapStatusToBackend(data.status);
    const response = await api.patch(`${this.basePath}/${id}`, null, {
      params: { status: backendStatus },
    });
    const result = response.data.data || response.data;
    // Map backend response to frontend entity format
    return {
      batteryTransferID: result.TransferID || result.batteryTransferID || id,
      batteryID: result.BatteryID || result.batteryID || '',
      fromStationID: result.FromStationID || result.fromStationID || '',
      toStationID: result.ToStationID || result.toStationID || '',
      transferDate: result.TransferDate ? new Date(result.TransferDate).toISOString() : (result.transferDate || ''),
      status: this.mapStatus(result.TransferStatus || result.status),
    };
  }
  
  private mapStatusToBackend(status: BatteryTransfer['status']): string {
    // Map frontend status to backend format
    if (status === 'In-Transit') return 'InTransit';
    if (status === 'Completed') return 'Delivered'; // Backend uses "Delivered" instead of "Completed"
    return status;
  }
}

// Export singleton instance
export const batteryTransferRepository = new BatteryTransferRepository();

