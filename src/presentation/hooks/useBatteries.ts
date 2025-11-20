/**
 * useBatteries Hook
 * Custom hook for battery operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Battery, BatteryInventory, UpdateBatteryStatusData } from '@/domain/dto/Hoang/Battery';
import {
  getBatteriesByStationUseCase,
  getBatteryInventoryUseCase,
  updateBatteryStatusUseCase,
} from '@/application/usecases/battery';

export function useBatteries(stationId: string | undefined) {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [inventory, setInventory] = useState<BatteryInventory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadBatteries = useCallback(async () => {
    if (!stationId) {
      setBatteries([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBatteriesByStationUseCase.execute(stationId);
      setBatteries(data);
    } catch (e) {
      const error = e as Error;
      setError(error);
      console.error('[useBatteries] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  const loadInventory = useCallback(async () => {
    if (!stationId) {
      setInventory(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBatteryInventoryUseCase.execute(stationId);
      setInventory(data);
    } catch (e) {
      const error = e as Error;
      setError(error);
      console.error('[useBatteries] Load inventory error:', error);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  const updateStatus = useCallback(async (data: UpdateBatteryStatusData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useBatteries] Updating battery status:', data);
      
      // Call backend to update
      const updatedBattery = await updateBatteryStatusUseCase.execute(data);
      console.log('[useBatteries] Backend returned:', updatedBattery);
      
      // Optimistically update batteries state with new status
      setBatteries((prev) => {
        const updated = prev.map((b) => {
          if (b.batteryCode === data.batteryId || b.batteryId === data.batteryId || b.batteryID === data.batteryId) {
            console.log('[useBatteries] Updating battery in state:', {
              id: b.batteryId || b.batteryID,
              oldStatus: b.status,
              newStatus: data.status
            });
            return { ...b, status: data.status };
          }
          return b;
        });
        return updated;
      });
      
      // Wait 500ms for backend to propagate changes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh to verify backend actually saved the changes
      console.log('[useBatteries] Refreshing from backend to verify save...');
      await loadBatteries();
      await loadInventory();
      
      console.log('[useBatteries] Update complete');
    } catch (e) {
      const error = e as Error;
      setError(error);
      console.error('[useBatteries] Update status error:', error);
      throw error; // Re-throw to let caller handle
    } finally {
      setLoading(false);
    }
  }, [loadBatteries, loadInventory]);

  useEffect(() => {
    loadBatteries();
    loadInventory();
  }, [loadBatteries, loadInventory]);

  return {
    batteries,
    inventory,
    loading,
    error,
    refetch: loadBatteries,
    refetchInventory: loadInventory,
    updateStatus,
  };
}
