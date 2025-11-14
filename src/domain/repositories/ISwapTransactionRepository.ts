/**
 * SwapTransaction Repository Interface
 * Định nghĩa contract cho swap transaction operations
 */

import {
  SwapTransaction,
  CreateSwapTransactionData,
  CompleteSwapTransactionData,
} from '../entities/SwapTransaction';

export interface ISwapTransactionRepository {
  /**
   * Get all swap transactions
   */
  getAll(): Promise<SwapTransaction[]>;

  /**
   * Get swap transaction by ID
   */
  getById(id: string): Promise<SwapTransaction>;

  /**
   * Get swap transactions by station
   */
  getByStation(stationID: string): Promise<SwapTransaction[]>;

  /**
   * Get swap transactions by user
   */
  getByUser(userID: string): Promise<SwapTransaction[]>;

  /**
   * Create new swap transaction
   */
  create(data: CreateSwapTransactionData): Promise<SwapTransaction>;

  /**
   * Complete swap transaction
   */
  complete(id: string, data: CompleteSwapTransactionData): Promise<SwapTransaction>;

  /**
   * Update swap transaction status
   */
  updateStatus(
    id: string,
    status: SwapTransaction['status']
  ): Promise<SwapTransaction>;

  /**
   * Cancel swap transaction
   */
  cancel(id: string): Promise<SwapTransaction>;
}
