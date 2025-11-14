'use client';

import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/domain/entities/Booking';
import { getBookingsByStationUseCase, updateBookingStatusUseCase } from '@/application/usecases/booking';
import { confirmBookingUseCase, ConfirmBookingResult } from '@/application/usecases/booking/ConfirmBooking.usecase';

interface UseBookingsOptions {
  autoLoad?: boolean;
}

export const useBookings = (stationId?: string, options: UseBookingsOptions = {}) => {
  const { autoLoad = true } = options;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!stationId) {
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingsData = await getBookingsByStationUseCase.execute(stationId);
      setBookings(bookingsData);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch bookings');
      setError(error);
      console.error('[useBookings] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  // Auto-fetch on mount and when stationId changes
  useEffect(() => {
    if (autoLoad) {
      fetchBookings();
    }
  }, [fetchBookings, autoLoad]);

  // Update booking status
  const updateStatus = useCallback(async (
    bookingId: string,
    status: Booking['bookingStatus']
  ) => {
    try {
      setLoading(true);
      setError(null);

      await updateBookingStatusUseCase.execute(bookingId, status);

      // Refetch bookings after update
      await fetchBookings();
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to update booking status');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  // Confirm booking
  const confirm = useCallback(async (bookingId: string): Promise<ConfirmBookingResult> => {
    try {
      setLoading(true);
      setError(null);

      const result = await confirmBookingUseCase.execute(bookingId);

      // Update local state
      setBookings(prev => prev.map(b => 
        b.bookingID === bookingId 
          ? { ...b, bookingStatus: 'completed' as any }
          : b
      ));

      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err?.message || 'Failed to confirm booking');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    updateStatus,
    confirm,
  };
};


