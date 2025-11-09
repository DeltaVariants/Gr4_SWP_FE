/**
 * Types cho Check-in Flow
 */

import { Booking } from '@/domain/entities/Booking';
import { Battery } from '@/domain/entities/Battery';

export type CheckInStep = 'scan' | 'verify' | 'payment' | 'swap' | 'completed';

export interface CheckInStepProps {
  onNext?: () => void;
  onBack?: () => void;
}

export interface ScanStepProps extends CheckInStepProps {
  reservationId: string;
  setReservationId: (id: string) => void;
  onSubmit: () => void;
}

export interface VerifyStepProps extends CheckInStepProps {
  reservationId: string;
  bookingData: Booking | null;
  driverName: string;
  vehicle: string;
  batteryType: string;
  loading: boolean;
  onVerify: () => void;
}

export interface PaymentStepProps extends CheckInStepProps {
  bookingData: Booking | null;
  driverName: string;
  swapTransactionId: string | null;
  stationId: string | undefined;
  onComplete: () => void;
}

export interface SwapStepProps extends CheckInStepProps {
  bookingData: Booking | null;
  driverName: string;
  oldBatteryId: string;
  newBatteryId: string;
  setOldBatteryId: (id: string) => void;
  setNewBatteryId: (id: string) => void;
  batteries: Battery[];
  stationId?: string;
  fromPayment?: boolean;
  onComplete: () => void;
}

export interface CompletedStepProps {
  driverName: string;
  onReset: () => void;
}


