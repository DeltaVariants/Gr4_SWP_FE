/**
 * SwapTransaction Repository Implementation
 * Implements ISwapTransactionRepository using API calls
 */

import { ISwapTransactionRepository } from '@/domain/repositories/ISwapTransactionRepository';
import {
  SwapTransaction,
  CreateSwapTransactionData,
  CompleteSwapTransactionData,
} from '@/domain/entities/SwapTransaction';
import api from '@/lib/api';

export class SwapTransactionRepository implements ISwapTransactionRepository {
  private readonly basePath = '/swap-transactions';

  async getAll(): Promise<SwapTransaction[]> {
    const response = await api.get(this.basePath);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<SwapTransaction> {
    const response = await api.get(`${this.basePath}/${id}`);
    return response.data.data || response.data;
  }

  async getByStation(stationID: string): Promise<SwapTransaction[]> {
    const response = await api.get(`${this.basePath}/station/${stationID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getByUser(userID: string): Promise<SwapTransaction[]> {
    const response = await api.get(`${this.basePath}/user/${userID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async create(data: CreateSwapTransactionData): Promise<SwapTransaction> {
    const response = await api.post(this.basePath, data);
    return response.data.data || response.data;
  }

  async complete(
    id: string,
    data: CompleteSwapTransactionData
  ): Promise<SwapTransaction> {
    // API: POST /api/swap-transactions/{id}/completed
    const response = await api.post(`${this.basePath}/${id}/completed`, data);
    return response.data.data || response.data;
  }

  async updateStatus(
    id: string,
    status: SwapTransaction['status']
  ): Promise<SwapTransaction> {
    const response = await api.patch(`${this.basePath}/${id}`, { status });
    return response.data.data || response.data;
  }

  async cancel(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const swapTransactionRepository = new SwapTransactionRepository();
