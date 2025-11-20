/**
 * SwapTransaction Repository Implementation
 * Implements ISwapTransactionRepository using API calls
 */

import { ISwapTransactionRepository } from '@/domain/repositories/Hoang/ISwapTransactionRepository';
import {
  SwapTransaction,
  CreateSwapTransactionData,
  CompleteSwapTransactionData,
} from '@/domain/dto/Hoang/SwapTransaction';
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

  async getByStation(stationID?: string): Promise<SwapTransaction[]> {
    // Endpoint: GET /api/stations/swapTransactions
    // Backend tự động lấy stationID từ token/context, không cần truyền trong path
    const response = await api.get('/stations/swapTransactions');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async getByUser(userID: string): Promise<SwapTransaction[]> {
    const response = await api.get(`${this.basePath}/user/${userID}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  async create(data: CreateSwapTransactionData): Promise<SwapTransaction> {
    console.log('[SwapTransactionRepository] Creating swap transaction:', {
      url: `${this.basePath}`,
      data: {
        ...data,
        // Don't log sensitive data
      },
    });
    
    try {
      const response = await api.post(this.basePath, data);
      console.log('[SwapTransactionRepository] Create response:', {
        status: response.status,
        data: response.data,
      });
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('[SwapTransactionRepository] Create failed:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  }

  async complete(
    id: string,
    soH?: number | null // Optional SoH parameter for old battery
  ): Promise<SwapTransaction> {
    // API: POST /api/swap-transactions/{id}/completed?Soh={soh}
    // Backend nhận SoH qua query parameter (optional)
    const params: any = {};
    if (soH !== undefined && soH !== null) {
      params.Soh = soH;
    }
    
    console.log('[SwapTransactionRepository] Completing swap transaction:', { id, soH, params });
    
    const response = await api.post(`${this.basePath}/${id}/completed`, null, {
      params
    });
    return response.data.data || response.data;
  }

  async updateStatus(
    id: string,
    status: SwapTransaction['status']
  ): Promise<SwapTransaction> {
    const response = await api.patch(`${this.basePath}/${id}`, { status });
    return response.data.data || response.data;
  }

  async cancel(id: string): Promise<SwapTransaction> {
    // Backend API: POST /api/swap-transactions/{id}/cancelled
    // Backend không nhận payload, chỉ cần transactionID
    const response = await api.post(`${this.basePath}/${id}/cancelled`);
    return response.data.data || response.data;
  }
}

// Export singleton instance
export const swapTransactionRepository = new SwapTransactionRepository();

