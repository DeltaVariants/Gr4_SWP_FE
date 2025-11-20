'use client';

import { useState, useEffect, useCallback } from 'react';
import { BatteryTransfer } from '@/domain/dto/Hoang/BatteryTransfer';
import { batteryTransferRepository } from '@/infrastructure/repositories/Hoang/BatteryTransferRepository';

interface UseBatteryTransfersOptions {
  transferId?: string;
  stationId?: string;
  autoLoad?: boolean;
}

export const useBatteryTransfers = (options: UseBatteryTransfersOptions = {}) => {
  const { transferId, stationId, autoLoad = true } = options;
  const [transfer, setTransfer] = useState<BatteryTransfer | null>(null);
  const [transfers, setTransfers] = useState<BatteryTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load single transfer by ID
  const loadTransfer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const transferData = await batteryTransferRepository.getById(id);
      setTransfer(transferData);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to load transfer');
      setError(error);
      console.error('[useBatteryTransfers] Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch battery transfers list
  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let transfersData: BatteryTransfer[];
      if (stationId) {
        transfersData = await batteryTransferRepository.getByStation(stationId);
      } else {
        transfersData = await batteryTransferRepository.getAll();
      }

      setTransfers(transfersData);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch battery transfers');
      setError(error);
      console.error('[useBatteryTransfers] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  // Auto-load transfer if transferId is provided
  useEffect(() => {
    if (transferId && autoLoad) {
      loadTransfer(transferId);
    }
  }, [transferId, autoLoad, loadTransfer]);

  // Auto-fetch transfers list if stationId is provided
  useEffect(() => {
    if (stationId && autoLoad && !transferId) {
      fetchTransfers();
    }
  }, [stationId, autoLoad, transferId, fetchTransfers]);

  // Update transfer status
  const updateTransferStatus = useCallback(async (
    id: string,
    status: BatteryTransfer['status']
  ) => {
    try {
      setLoading(true);
      setError(null);

      await batteryTransferRepository.update(id, { status });

      // Reload transfer after update
      await loadTransfer(id);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to update transfer status');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadTransfer]);

  return {
    transfer,
    transfers,
    loading,
    error,
    loadTransfer,
    updateTransferStatus,
    refetch: transferId ? () => loadTransfer(transferId) : fetchTransfers,
  };
};

