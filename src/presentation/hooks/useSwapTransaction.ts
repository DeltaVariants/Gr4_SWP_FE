/**
 * useSwapTransaction Hook
 * Quản lý logic load và xử lý swap transaction
 */

import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface SwapTransaction {
  swapTransactionID?: string;
  transactionID?: string;
  bookingID?: string;
  [key: string]: any;
}

export function useSwapTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load swap transaction từ booking ID
   */
  const loadSwapTransactionByBooking = useCallback(async (bookingId: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      console.debug('[useSwapTransaction] Loading for booking:', bookingId);

      // Thử nhiều endpoints
      let swapTransactions: SwapTransaction[] = [];

      try {
        // Option 1: GET /swap-transactions
        const response = await api.get('/swap-transactions');
        swapTransactions = response.data;
        console.debug('[useSwapTransaction] Got', swapTransactions?.length || 0, 'from /swap-transactions');
      } catch (err) {
        console.warn('[useSwapTransaction] /swap-transactions failed, trying /stations/swapTransactions');
        
        // Option 2: GET /stations/swapTransactions
        try {
          const response = await api.get('/stations/swapTransactions');
          swapTransactions = response.data;
          console.debug('[useSwapTransaction] Got', swapTransactions?.length || 0, 'from /stations/swapTransactions');
        } catch (err2) {
          console.error('[useSwapTransaction] Both endpoints failed');
          throw new Error('Không thể tải thông tin giao dịch');
        }
      }

      // Tìm transaction theo bookingID
      const swapTx = swapTransactions.find(
        (tx) => tx.bookingID === bookingId
      );

      if (swapTx) {
        const txId = swapTx.swapTransactionID || swapTx.transactionID;
        console.debug('[useSwapTransaction] Found transaction:', txId);
        return txId || null;
      } else {
        console.warn('[useSwapTransaction] No transaction found for booking:', bookingId);
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi tải swap transaction';
      setError(errorMsg);
      console.error('[useSwapTransaction] Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    loadSwapTransactionByBooking,
  };
}


