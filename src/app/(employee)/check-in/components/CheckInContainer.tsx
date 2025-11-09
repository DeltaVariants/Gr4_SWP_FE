/**
 * CheckInContainer Component
 * Main container managing the entire check-in flow
 * 
 * Flow: Scan → Verify → Payment → Swap → Completed
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCheckInFlow } from '@/presentation/hooks/useCheckInFlow';
import { useBookings } from '@/presentation/hooks/useBookings';
import { useBatteries } from '@/presentation/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import api from '@/lib/api';
import { 
  isPaymentCallback, 
  restoreCheckInState, 
  clearCheckInState 
} from '../utils/checkInPersistence';

// Components
import { StepIndicator } from './StepIndicator';
import { ScanStep } from './ScanStep';
import { VerifyStep } from './VerifyStep';
import { PaymentStep } from './PaymentStep';
import { SwapStep } from './SwapStep';
import { CompletedStep } from './CompletedStep';

export default function CheckInContainer() {
  const params = useSearchParams();
  const { showToast } = useToast();
  const { user } = useAuth();
  const reservationIdParam = params.get('reservationId');

  const stationId = user?.stationId;
  const { bookings, searchBooking } = useBookings(stationId);
  const { batteries } = useBatteries(stationId);

  const [loading, setLoading] = useState(false);
  const [stateRestored, setStateRestored] = useState(false);

  // Use check-in flow hook
  const {
    step,
    reservationId,
    bookingData,
    driverName,
    vehicle,
    batteryType,
    oldBatteryId,
    newBatteryId,
    swapTransactionId,
    setReservationId,
    setBookingData,
    setOldBatteryId,
    setNewBatteryId,
    setSwapTransactionId,
    goToScan,
    goToVerify,
    goToPayment,
    goToSwap,
    goToCompleted,
    resetFlow,
  } = useCheckInFlow(reservationIdParam || undefined);

  // CRITICAL: Restore state when returning from PayOS
  useEffect(() => {
    // Check if this is a payment callback
    if (isPaymentCallback(params)) {
      console.log('[CheckInContainer] Payment callback detected, restoring state...');
      
      const savedState = restoreCheckInState();
      if (savedState) {
        console.log('[CheckInContainer] Restored state:', savedState);
        
        // Restore all state
        setReservationId(savedState.reservationId);
        setBookingData(savedState.bookingData);
        setSwapTransactionId(savedState.swapTransactionId);
        
        // Show payment completed message
        showToast({
          type: 'success',
          message: '✅ Payment completed! Please continue with battery swap.',
          duration: 4000,
        });
        
        // Go directly to swap step
        goToSwap();
        setStateRestored(true);
        
        // Clear saved state after restore
        setTimeout(() => clearCheckInState(), 1000);
      } else {
        console.warn('[CheckInContainer] No saved state found, redirecting to scan');
        showToast({
          type: 'warning',
          message: 'Session expired. Please start again.',
        });
        goToScan();
      }
    }
  }, [params]);

  // Load booking when reservationIdParam is available (only when state not restored)
  useEffect(() => {
    if (reservationIdParam && step === 'verify' && !stateRestored) {
      loadBookingData(reservationIdParam);
    }
  }, [reservationIdParam, stateRestored]);

  /**
   * Load booking data
   */
  const loadBookingData = async (searchTerm: string) => {
    try {
      setLoading(true);

      console.debug('[CheckIn] Loading booking:', searchTerm);

      // Search in local cache first
      let booking: any = bookings.find(
        (b) =>
          b.bookingID === searchTerm || b.bookingID?.toLowerCase() === searchTerm.toLowerCase()
      );

      // If not found, call API
      if (!booking) {
        try {
          const apiResult = await searchBooking(searchTerm);
          if (apiResult) booking = apiResult;
        } catch (searchError) {
          console.error('[CheckIn] Search failed:', searchError);
        }
      }

      if (booking) {
        console.debug('[CheckIn] ✅ Found:', booking);
        setBookingData(booking);

        showToast({
          type: 'success',
          message: `✅ Found: ${booking.customerName || booking.vehicleId}`,
          duration: 2000,
        });
      } else {
        showToast({
          type: 'error',
          message: 'Booking not found',
        });
        goToScan();
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error?.message || 'Search error',
      });
      goToScan();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle scan submit
   */
  const handleScanSubmit = () => {
    if (!reservationId.trim()) {
      showToast({ type: 'error', message: 'Please enter booking code' });
      return;
    }

    goToVerify();
    loadBookingData(reservationId);
  };

  /**
   * Handle verify and proceed to payment
   */
  const handleVerifyAndProceedToPayment = async () => {
    if (!driverName) {
      showToast({ type: 'error', message: 'Please confirm customer information' });
      return;
    }

    try {
      setLoading(true);

      console.debug('[CheckIn] 🔄 Verified - Now confirming booking...');

      const bookingId = bookingData?.bookingID || (bookingData as any)?.id;
      if (!bookingId) {
        throw new Error('Booking ID not found');
      }

      // Confirm booking → Backend creates SwapTransaction
      console.debug('[CheckIn] 📤 PATCH /bookings/' + bookingId + '?status=completed');

      try {
        await api.patch(`/bookings/${bookingId}`, null, {
          params: { status: 'completed' },
        });
        console.debug('[CheckIn] ✅ Booking confirmed (status=completed)');
      } catch (patchError: any) {
        console.error('[CheckIn] ❌ Failed to PATCH booking:', patchError);
        // Continue if 404 error (booking already completed)
        if (patchError.response?.status !== 404) {
          throw patchError;
        }
      }

      // Wait for backend to create SwapTransaction
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Load SwapTransaction
      console.debug('[CheckIn] 📥 Loading SwapTransaction after confirm...');
      try {
        let swapTransactions: any[] = [];

        // Try multiple endpoints
        try {
          const swapResponse = await api.get('/swap-transactions');
          swapTransactions = swapResponse.data;
          console.debug('[CheckIn] Got', swapTransactions?.length || 0, 'from /swap-transactions');
        } catch (err1) {
          console.warn('[CheckIn] /swap-transactions failed, trying /stations/swapTransactions');
          const swapResponse = await api.get('/stations/swapTransactions');
          swapTransactions = swapResponse.data;
          console.debug('[CheckIn] Got', swapTransactions?.length || 0, 'from /stations/swapTransactions');
        }

        const swapTx = swapTransactions.find((tx: any) => tx.bookingID === bookingId);

        if (swapTx) {
          const txId = swapTx.swapTransactionID || swapTx.transactionID;
          console.debug('[CheckIn] ✅ Found SwapTransaction:', txId);
          setSwapTransactionId(txId);
        } else {
          console.warn('[CheckIn] ⚠️ No SwapTransaction found yet');
          setSwapTransactionId(null);
        }
      } catch (swapError) {
        console.error('[CheckIn] ❌ Failed to load SwapTransaction:', swapError);
        setSwapTransactionId(null);
      }

      showToast({ type: 'success', message: 'Check-in successful!' });
      goToPayment();
    } catch (error: any) {
      console.error('[CheckIn] ❌ Error:', error);
      showToast({ type: 'error', message: error?.message || 'Failed to check-in' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle reset and start flow again
   */
  const handleReset = () => {
    resetFlow();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Scan Step */}
      {step === 'scan' && (
        <ScanStep
          reservationId={reservationId}
          setReservationId={setReservationId}
          onSubmit={handleScanSubmit}
        />
      )}

      {/* Verify Step */}
      {step === 'verify' && (
        <VerifyStep
          reservationId={reservationId}
          bookingData={bookingData}
          driverName={driverName}
          vehicle={vehicle}
          batteryType={batteryType}
          loading={loading}
          onVerify={handleVerifyAndProceedToPayment}
          onBack={goToScan}
        />
      )}

      {/* Payment Step */}
      {step === 'payment' && (
        <PaymentStep
          bookingData={bookingData}
          driverName={driverName}
          swapTransactionId={swapTransactionId}
          stationId={stationId}
          onComplete={goToSwap}
          onBack={goToVerify}
        />
      )}

      {/* Swap Step */}
      {step === 'swap' && (
        <SwapStep
          bookingData={bookingData}
          driverName={driverName}
          oldBatteryId={oldBatteryId}
          newBatteryId={newBatteryId}
          setOldBatteryId={setOldBatteryId}
          setNewBatteryId={setNewBatteryId}
          batteries={batteries}
          stationId={stationId}
          fromPayment={true}
          onComplete={goToCompleted}
          onBack={goToPayment}
        />
      )}

      {/* Completed Step */}
      {step === 'completed' && <CompletedStep driverName={driverName} onReset={handleReset} />}
    </div>
  );
}

