'use client';

import { useState, useCallback } from 'react';
import { Booking } from '@/domain/dto/Hoang/Booking';

type CheckInStep = 'verify' | 'swap' | 'completed';

export const useCheckInFlow = (initialBookingId?: string) => {
  const [step, setStep] = useState<CheckInStep>('verify');
  const [reservationId, setReservationId] = useState<string | undefined>(initialBookingId);
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [swapTransactionId, setSwapTransactionId] = useState<string | undefined>(undefined);

  // Extract driver name from booking
  // Backend may return customerName, userName, or driverName
  const driverName = bookingData?.customerName || 
                     (bookingData as any)?.userName || 
                     (bookingData as any)?.driverName || 
                     'N/A';

  // Extract vehicle info as string
  // Backend may return vehicleName, vehicleId, or licensePlate
  const vehicle = (bookingData as any)?.vehicleName || 
                  (bookingData as any)?.licensePlate || 
                  bookingData?.vehicleId || 
                  'N/A';

  // Extract battery type
  const batteryType = bookingData?.batteryType || 'N/A';

  // Navigation functions
  const goToVerify = useCallback(() => {
    setStep('verify');
  }, []);

  const goToSwap = useCallback(() => {
    setStep('swap');
  }, []);

  const goToCompleted = useCallback(() => {
    setStep('completed');
  }, []);

  const resetFlow = useCallback(() => {
    setStep('verify');
    setReservationId(undefined);
    setBookingData(null);
    setSwapTransactionId(undefined);
  }, []);

  return {
    step,
    reservationId,
    bookingData,
    driverName,
    vehicle,
    batteryType,
    swapTransactionId,
    setReservationId,
    setBookingData,
    setSwapTransactionId,
    goToVerify,
    goToSwap,
    goToCompleted,
    resetFlow,
  };
};

