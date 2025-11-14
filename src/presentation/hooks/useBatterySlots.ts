'use client';

import { useState, useEffect, useCallback } from 'react';
import { BatterySlot } from '@/domain/entities/BatterySlot';
import { batterySlotRepository } from '@/infrastructure/repositories/BatterySlotRepository';

export const useBatterySlots = (stationId?: string) => {
  const [slots, setSlots] = useState<BatterySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch battery slots
  const fetchSlots = useCallback(async () => {
    if (!stationId) {
      setSlots([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const slotsData = await batterySlotRepository.getByStation(stationId);
      setSlots(slotsData);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch battery slots');
      setError(error);
      console.error('[useBatterySlots] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  // Auto-fetch on mount and when stationId changes
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return {
    slots,
    loading,
    error,
    refetch: fetchSlots,
  };
};




