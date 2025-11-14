/**
 * CheckInContainer Component
 * Flow: Verify → Swap → Completed
 * 
 * Flow đúng với backend:
 * 1. Reservations page: Confirm booking với status="completed"
 *    - Backend tự động tạo SwapTransaction với status="initiated"
 *    - Backend trả về SwapTransactionID trong response
 * 2. CheckInContainer: Nhận bookingId và swapTransactionId từ URL
 * 3. Verify: Load booking data, hiển thị thông tin khách hàng
 * 4. Swap: Complete swap transaction (POST /api/swap-transactions/{id}/completed)
 *    - Backend có thể xử lý status="initiated" trực tiếp
 * 5. Completed: Hiển thị success message
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { useCheckInFlow } from '@/presentation/hooks/useCheckInFlow';
import { bookingRepository } from '@/infrastructure/repositories/BookingRepository';
import { swapTransactionRepository } from '@/infrastructure/repositories/SwapTransactionRepository';
import { StepIndicator } from './StepIndicator';
import { VerifyStep } from './VerifyStep';
import { SwapStep } from './SwapStep';
import { CompletedStep } from './CompletedStep';
import { Loader2 } from 'lucide-react';

export default function CheckInContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Get bookingId and swapTransactionId from URL
  const bookingIdFromUrl = searchParams.get('bookingId') || searchParams.get('reservationId');
  const swapTransactionIdFromUrl = searchParams.get('swapTransactionId');
  
  const {
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
  } = useCheckInFlow(bookingIdFromUrl || undefined);

  const [loading, setLoading] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);

  // Load booking data when bookingId is available
  useEffect(() => {
    const loadBookingData = async () => {
      if (!bookingIdFromUrl) {
        // No bookingId - redirect to reservations
        showToast({
          type: 'error',
          message: 'Không tìm thấy booking ID. Vui lòng chọn booking từ trang đặt chỗ.',
        });
        router.push('/reservations');
        return;
      }

      setReservationId(bookingIdFromUrl);
      
      // Set swapTransactionId from URL if available (from confirm response)
      if (swapTransactionIdFromUrl && !swapTransactionId) {
        console.log('[CheckIn] ✅ Using swapTransactionId from URL:', swapTransactionIdFromUrl);
        setSwapTransactionId(swapTransactionIdFromUrl);
      }
      
      // If already on verify step or later, don't reload
      if (step !== 'verify') return;

      try {
        setLoadingBooking(true);
        console.log('[CheckIn] Loading booking:', bookingIdFromUrl);
        
        const booking = await bookingRepository.getById(bookingIdFromUrl);
        console.log('[CheckIn] ✅ Loaded booking:', booking);
        
        setBookingData(booking);
        
        // Try to find existing swap transaction from station (fallback if swapTransactionId not set)
        // Note: swapTransactionId should be set from confirm response or URL, but we check here as fallback
        if (!swapTransactionId && !swapTransactionIdFromUrl) {
          try {
            const swaps = await swapTransactionRepository.getByStation();
            const existingSwap = swaps.find((s: any) => {
              const swapBookingId = s.bookingID || s.bookingId || (s as any).booking_id;
              return swapBookingId === bookingIdFromUrl;
            });
            
            if (existingSwap) {
              const swapId = (existingSwap as any).swapTransactionID || (existingSwap as any).transactionID || (existingSwap as any).id;
              if (swapId) {
                console.log('[CheckIn] ✅ Found existing swap transaction (fallback):', swapId);
                setSwapTransactionId(swapId);
              }
            }
          } catch (swapError) {
            console.warn('[CheckIn] Could not load swap transactions:', swapError);
            // Continue without swap transaction - it should have been created during confirm
          }
        }
    } catch (error: any) {
        console.error('[CheckIn] ❌ Failed to load booking:', error);
      showToast({
        type: 'error',
          message: error?.message || 'Failed to load booking information',
      });
    } finally {
        setLoadingBooking(false);
      }
    };

    loadBookingData();
  }, [bookingIdFromUrl, swapTransactionIdFromUrl, step, setReservationId, setBookingData, setSwapTransactionId, swapTransactionId, showToast, router]);

  // Handle verify - proceed to swap
  const handleVerify = async () => {
    if (!bookingData) {
      showToast({
        type: 'error',
        message: 'Booking data not found',
      });
      return;
    }

    // Check if swap transaction exists
    // swapTransactionId should be set from confirm response
    if (!swapTransactionId) {
      showToast({
        type: 'error',
        message: 'Swap transaction not found. Please confirm booking first.',
      });
      return;
    }

    // Proceed to swap step
    goToSwap();
  };

  // Handle swap complete
  const handleSwapComplete = async (transactionId?: string) => {
    console.log('[CheckIn] ✅ Swap completed, transactionId:', transactionId);
    goToCompleted();
  };

  // Handle swap cancel
  const handleSwapCancel = () => {
    console.log('[CheckIn] ❌ Swap cancelled');
    resetFlow();
    router.push('/reservations');
  };

  // Handle reset - go back to reservations
  const handleReset = () => {
    resetFlow();
    router.push('/reservations');
  };

  // Show loading if booking is being loaded
  if (loadingBooking && step === 'verify') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900">Loading booking information...</p>
        <p className="text-sm text-gray-600 mt-2">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Step Content */}
      {step === 'verify' && (
        <VerifyStep
          reservationId={reservationId}
          bookingData={bookingData}
          driverName={driverName}
          vehicle={vehicle}
          batteryType={batteryType}
          loading={loading || loadingBooking}
          onVerify={handleVerify}
          onBack={handleReset}
        />
      )}

      {step === 'swap' && (
        <SwapStep
          bookingData={bookingData}
          driverName={driverName}
          swapTransactionId={swapTransactionId}
          onComplete={handleSwapComplete}
          onBack={() => goToVerify()}
          onCancel={handleSwapCancel}
        />
      )}

      {step === 'completed' && (
        <CompletedStep
          driverName={driverName}
          onReset={handleReset}
        />
      )}
    </div>
  );
}


