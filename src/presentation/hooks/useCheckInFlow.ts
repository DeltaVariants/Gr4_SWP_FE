/**
 * useCheckInFlow Hook
 * Quản lý state và logic của toàn bộ check-in flow
 * 
 * Flow: Scan → Verify → Payment → Swap → Completed
 */

import { useState, useCallback } from 'react';
import { Booking } from '@/domain/entities/Booking';

export type CheckInStep = 'scan' | 'verify' | 'payment' | 'swap' | 'completed';

interface CheckInFlowState {
  step: CheckInStep;
  reservationId: string;
  bookingData: Booking | null;
  driverName: string;
  vehicle: string;
  batteryType: string;
  oldBatteryId: string;
  newBatteryId: string;
  swapTransactionId: string | null;
  paymentCompleted: boolean;
}

export function useCheckInFlow(initialReservationId?: string) {
  const [state, setState] = useState<CheckInFlowState>({
    step: initialReservationId ? 'verify' : 'scan',
    reservationId: initialReservationId || '',
    bookingData: null,
    driverName: '',
    vehicle: '',
    batteryType: '',
    oldBatteryId: '',
    newBatteryId: '',
    swapTransactionId: null,
    paymentCompleted: false,
  });

  // Navigation methods
  const goToStep = useCallback((step: CheckInStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const goToScan = useCallback(() => goToStep('scan'), [goToStep]);
  const goToVerify = useCallback(() => goToStep('verify'), [goToStep]);
  const goToPayment = useCallback(() => goToStep('payment'), [goToStep]);
  const goToSwap = useCallback(() => {
    setState((prev) => ({ ...prev, step: 'swap', paymentCompleted: true }));
  }, []);
  const goToCompleted = useCallback(() => goToStep('completed'), [goToStep]);

  // Update methods
  const setReservationId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, reservationId: id }));
  }, []);

  const setBookingData = useCallback((data: Booking | null) => {
    setState((prev) => ({
      ...prev,
      bookingData: data,
      driverName: data?.customerName || (data as any)?.userName || '',
      vehicle: (data as any)?.vehicleId || '',
      batteryType: data?.batteryType || '',
    }));
  }, []);

  const setDriverName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, driverName: name }));
  }, []);

  const setOldBatteryId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, oldBatteryId: id }));
  }, []);

  const setNewBatteryId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, newBatteryId: id }));
  }, []);

  const setSwapTransactionId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, swapTransactionId: id }));
  }, []);

  // Reset flow
  const resetFlow = useCallback(() => {
    setState({
      step: 'scan',
      reservationId: '',
      bookingData: null,
      driverName: '',
      vehicle: '',
      batteryType: '',
      oldBatteryId: '',
      newBatteryId: '',
      swapTransactionId: null,
      paymentCompleted: false,
    });
  }, []);

  return {
    // State
    ...state,
    
    // Navigation
    goToStep,
    goToScan,
    goToVerify,
    goToPayment,
    goToSwap,
    goToCompleted,
    
    // Updates
    setReservationId,
    setBookingData,
    setDriverName,
    setOldBatteryId,
    setNewBatteryId,
    setSwapTransactionId,
    
    // Actions
    resetFlow,
  };
}

