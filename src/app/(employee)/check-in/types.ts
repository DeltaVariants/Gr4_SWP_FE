/**
 * Types cho Check-in Flow
 */

import { Booking } from '@/domain/dto/Hoang/Booking';
import { Battery } from '@/domain/dto/Hoang/Battery';

export type CheckInStep = 'verify' | 'swap' | 'completed';

export interface CheckInStepProps {
  onNext?: () => void;
  onBack?: () => void;
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

export interface SwapStepProps extends CheckInStepProps {
  bookingData: Booking | null;
  driverName: string;
  swapTransactionId: string | null; // Swap transaction ID from verify step
  onComplete: (transactionId?: string) => void; // Nhận transactionID sau khi swap hoàn thành
}

export interface CompletedStepProps {
  driverName: string;
  onReset: () => void;
}


