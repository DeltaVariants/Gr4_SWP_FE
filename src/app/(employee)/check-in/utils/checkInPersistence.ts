/**
 * Check-in State Persistence Utility
 * Save and restore state when redirecting through PayOS
 */

import { Booking } from '@/domain/entities/Booking';
import { CheckInStep } from '../components/types';

const STORAGE_KEY = 'checkin_flow_state';

export interface CheckInPersistedState {
  step: CheckInStep;
  reservationId: string;
  bookingData: Booking | null;
  driverName: string;
  vehicle: string;
  batteryType: string;
  swapTransactionId: string | null;
  timestamp: number; // To expire old states
}

/**
 * Save state to sessionStorage
 */
export function persistCheckInState(state: Omit<CheckInPersistedState, 'timestamp'>) {
  try {
    const persistedState: CheckInPersistedState = {
      ...state,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    console.log('[CheckInPersistence] State saved:', persistedState);
  } catch (error) {
    console.error('[CheckInPersistence] Failed to save state:', error);
  }
}

/**
 * Restore state from sessionStorage
 */
export function restoreCheckInState(): CheckInPersistedState | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('[CheckInPersistence] No saved state found');
      return null;
    }

    const state: CheckInPersistedState = JSON.parse(stored);
    
    // Check if state is expired (older than 1 hour)
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - state.timestamp > ONE_HOUR) {
      console.warn('[CheckInPersistence] State expired, clearing');
      clearCheckInState();
      return null;
    }

    console.log('[CheckInPersistence] State restored:', state);
    return state;
  } catch (error) {
    console.error('[CheckInPersistence] Failed to restore state:', error);
    return null;
  }
}

/**
 * Clear state from sessionStorage
 */
export function clearCheckInState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('[CheckInPersistence] State cleared');
  } catch (error) {
    console.error('[CheckInPersistence] Failed to clear state:', error);
  }
}

/**
 * Check if there is a payment callback from PayOS
 */
export function isPaymentCallback(searchParams: URLSearchParams): boolean {
  // PayOS usually returns these params
  return (
    searchParams.has('orderCode') ||
    searchParams.has('status') ||
    searchParams.has('paymentStatus') ||
    searchParams.has('fromPayment')
  );
}


