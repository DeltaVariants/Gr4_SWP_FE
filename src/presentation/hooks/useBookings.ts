/**
 * useBookings Hook
 * Custom hook for booking operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Booking, CheckInData, SwapData } from '@/domain/entities/Booking';
import {
  getBookingsByStationUseCase,
  checkInBookingUseCase,
  completeSwapUseCase,
  searchBookingUseCase,
  updateBookingStatusUseCase,
} from '@/application/usecases/booking';

export function useBookings(stationId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadBookings = useCallback(async () => {
    if (!stationId) {
      setBookings([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBookingsByStationUseCase.execute(stationId);
      setBookings(data);
    } catch (e) {
      const error = e as Error;
      setError(error);
      console.error('[useBookings] Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  const checkIn = useCallback(async (data: CheckInData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBooking = await checkInBookingUseCase.execute(data);
      setBookings((prev) =>
        prev.map((b) => (b.bookingID === updatedBooking.bookingID ? updatedBooking : b))
      );
      return updatedBooking;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeSwap = useCallback(async (data: SwapData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBooking = await completeSwapUseCase.execute(data);
      setBookings((prev) =>
        prev.map((b) => (b.bookingID === updatedBooking.bookingID ? updatedBooking : b))
      );
      return updatedBooking;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchBooking = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const booking = await searchBookingUseCase.execute(searchTerm);
      return booking;
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (bookingId: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      await updateBookingStatusUseCase.execute(bookingId, status);
      // Optimistically update local state
      setBookings((prev) =>
        prev.map((b) => (b.bookingID === bookingId ? { ...b, bookingStatus: status as any } : b))
      );
    } catch (e) {
      const error = e as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: loadBookings,
    checkIn,
    completeSwap,
    searchBooking,
    updateStatus,
  };
}
