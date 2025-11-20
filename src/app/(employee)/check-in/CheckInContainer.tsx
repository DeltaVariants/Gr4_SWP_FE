/**
 * CheckInContainer Component
 * Flow: Verify → Swap → Completed
 * 
 * Flow đúng với backend:
 * 
 * **Case 1: Booking với subscription (tự động completed)**
 * 1. Customer tạo booking → Backend tự động:
 *    - Set status = "completed" (nếu có subscription)
 *    - Tạo SwapTransaction với status="initiated"
 * 2. Staff vào check-in page → CheckInContainer:
 *    - Phát hiện booking status = "completed"
 *    - Tìm SwapTransaction đã tồn tại
 *    - Đi thẳng đến SwapStep (bỏ qua VerifyStep)
 * 3. Swap: Complete swap transaction (POST /api/swap-transactions/{id}/completed)
 * 4. Completed: Hiển thị success message
 * 
 * **Case 2: Booking không có subscription (pending)**
 * 1. Customer tạo booking → status = "pending"
 * 2. Staff vào check-in page → CheckInContainer:
 *    - Phát hiện booking status = "pending"
 *    - Hiển thị VerifyStep
 * 3. Verify: Staff xác nhận → Gọi updateStatus("completed")
 *    - Backend tạo SwapTransaction và trả về SwapTransactionID
 * 4. Swap: Complete swap transaction
 * 5. Completed: Hiển thị success message
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { useCheckInFlow } from '@/presentation/hooks/useCheckInFlow';
import { bookingRepository } from '@/infrastructure/repositories/Hoang/BookingRepository';
import { swapTransactionRepository } from '@/infrastructure/repositories/Hoang/SwapTransactionRepository';
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
      
      // If already on swap or completed step, don't reload
      if (step === 'swap' || step === 'completed') return;

      try {
        setLoadingBooking(true);
        console.log('[CheckIn] Loading booking:', bookingIdFromUrl);
        
        const booking = await bookingRepository.getById(bookingIdFromUrl);
        console.log('[CheckIn] ✅ Loaded booking:', booking);
        
        setBookingData(booking);
        
        // Check booking status - Backend tự động complete booking nếu có subscription
        const bookingStatus = (booking as any).status || booking.bookingStatus || '';
        const statusLower = bookingStatus.toLowerCase();
        
        console.log('[CheckIn] Booking status:', { bookingStatus, statusLower });
        
        // Nếu booking đã completed → Tìm SwapTransaction đã tồn tại và đi thẳng đến SwapStep
        if (statusLower === 'completed') {
          console.log('[CheckIn] ⚡ Booking already completed - finding existing SwapTransaction...');
          
          // Helper function để tìm SwapTransaction
          // NOTE: getByStation() trả về SwapTransactionResponse (KHÔNG có BookingID)
          //       getAll() trả về SwapTransactionDTOs (CÓ BookingID)
          //       → Phải dùng getAll() để tìm theo BookingID
          const findSwapTransaction = async (retryCount = 0): Promise<string | null> => {
            const maxRetries = 3;
            const retryDelay = 1000; // 1 second
            
            try {
              // Dùng getAll() vì nó trả về SwapTransactionDTOs có BookingID
              // getByStation() trả về SwapTransactionResponse không có BookingID
              const allSwaps = await swapTransactionRepository.getAll();
              console.log('[CheckIn] 🔍 getAll returned', allSwaps.length, 'swap transactions');
              
              const existingSwap = allSwaps.find((s: any) => {
                // SwapTransactionDTOs có BookingID field
                const swapBookingId = s.BookingID || 
                                    s.bookingID || 
                                    s.bookingId || 
                                    s.BookingId ||
                                    (s as any).booking_id || 
                                    (s as any).booking_ID;
                
                const match = swapBookingId === bookingIdFromUrl;
                if (match) {
                  console.log('[CheckIn] 🔍 Found matching swap transaction:', {
                    swapBookingId,
                    bookingIdFromUrl,
                    swapKeys: Object.keys(s),
                    swapData: s
                  });
                }
                
                return match;
              });
              
              if (existingSwap) {
                // SwapTransactionDTOs có SwapTransactionID field
                const swapId = (existingSwap as any).SwapTransactionID || 
                            (existingSwap as any).swapTransactionID ||
                            (existingSwap as any).transactionID || 
                            (existingSwap as any).TransactionID ||
                            (existingSwap as any).id ||
                            (existingSwap as any).ID;
                
                if (swapId) {
                  console.log('[CheckIn] ✅ Found SwapTransaction via getAll:', swapId);
                  return swapId;
                }
              }
              
              // Retry logic: Nếu không tìm thấy và chưa hết retry, đợi một chút rồi thử lại
              if (retryCount < maxRetries) {
                console.log(`[CheckIn] ⏳ SwapTransaction not found, retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return findSwapTransaction(retryCount + 1);
              }
              
              return null;
            } catch (error) {
              console.error('[CheckIn] ❌ Error finding SwapTransaction:', error);
              return null;
            }
          };
          
          // Tìm SwapTransaction với retry
          try {
            const foundSwapId = await findSwapTransaction();
            
            if (foundSwapId) {
              console.log('[CheckIn] ✅ Found existing SwapTransaction:', foundSwapId);
              setSwapTransactionId(foundSwapId);
              // Đi thẳng đến SwapStep (bỏ qua VerifyStep)
              goToSwap();
              return;
            } else {
              // Không tìm thấy SwapTransaction sau nhiều lần thử
              // Theo backend logic, nếu booking completed thì SwapTransaction phải được tạo
              // Nhưng để tránh block user, vẫn cho phép đi đến VerifyStep để staff có thể xử lý
              console.warn('[CheckIn] ⚠️ Booking is completed but SwapTransaction not found after retries. This may be a backend error.');
              console.warn('[CheckIn] 💡 Proceeding to VerifyStep - staff can manually verify to find/create swap transaction.');
              showToast({
                type: 'info',
                message: 'Booking is completed. Swap transaction not found. Please click Verify to find or create it.',
              });
              // Vẫn ở VerifyStep để staff có thể xử lý
            }
          } catch (swapError) {
            console.error('[CheckIn] ❌ Failed to load swap transactions:', swapError);
            showToast({
              type: 'error',
              message: 'Failed to load swap transaction. Please try again or contact support.',
            });
            // Vẫn ở VerifyStep để staff có thể xử lý
          }
        } else {
          // Booking status = "pending" hoặc "confirmed" → Giữ flow Verify → Swap
          console.log('[CheckIn] 📋 Booking status is', bookingStatus, '- proceeding with Verify step');
          // Stay on verify step (default)
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
  }, [bookingIdFromUrl, swapTransactionIdFromUrl, step, setReservationId, setBookingData, setSwapTransactionId, swapTransactionId, showToast, router, goToSwap]);

  // Handle verify - Update booking status to "completed" to create SwapTransaction
  const handleVerify = async () => {
    if (!bookingData || !reservationId) {
      showToast({
        type: 'error',
        message: 'Booking data not found',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Kiểm tra booking status hiện tại
      const currentStatus = (bookingData as any).status || bookingData.bookingStatus || '';
      const statusLower = currentStatus.toLowerCase();
      
      // Nếu booking đã completed → Tìm SwapTransaction đã tồn tại (không gọi updateStatus)
      if (statusLower === 'completed') {
        console.log('[CheckIn] 📋 Booking already completed - finding SwapTransaction...');
        
        // Tìm SwapTransaction đã tồn tại
        let foundSwapId: string | null = null;
        
        try {
          // Dùng getAll() vì nó trả về SwapTransactionDTOs có BookingID
          // getByStation() trả về SwapTransactionResponse không có BookingID
          const allSwaps = await swapTransactionRepository.getAll();
          const existingSwap = allSwaps.find((s: any) => {
            const swapBookingId = s.BookingID || 
                                s.bookingID || 
                                s.bookingId || 
                                s.BookingId ||
                                (s as any).booking_id || 
                                (s as any).booking_ID;
            return swapBookingId === reservationId;
          });
          
          if (existingSwap) {
            foundSwapId = (existingSwap as any).SwapTransactionID || 
                        (existingSwap as any).swapTransactionID ||
                        (existingSwap as any).transactionID || 
                        (existingSwap as any).TransactionID ||
                        (existingSwap as any).id ||
                        (existingSwap as any).ID;
          }
          
          if (foundSwapId) {
            console.log('[CheckIn] ✅ Found SwapTransaction:', foundSwapId);
            setSwapTransactionId(foundSwapId);
            goToSwap();
            return;
          } else {
            throw new Error('SwapTransaction not found for this completed booking. Please contact support.');
          }
        } catch (swapError: any) {
          console.error('[CheckIn] ❌ Failed to find SwapTransaction:', swapError);
          showToast({
            type: 'error',
            message: swapError?.message || 'SwapTransaction not found. Please contact support.',
          });
          return;
        }
      }
      
      // Booking chưa completed → Staff không xử lý pending bookings
      // Pending bookings cần customer thanh toán/tạo subscription trước
      console.error('[CheckIn] ❌ Booking is not completed. Staff only handles completed bookings.');
      showToast({
        type: 'error',
        message: 'This booking is pending. Customer needs to complete payment/subscription first. Staff only handles completed bookings.',
      });
      setLoading(false);
      return;
    } catch (error: any) {
      console.error('[CheckIn] ❌ Failed to update booking status:', error);
      const errorMessage = error?.message || 'Failed to create swap transaction';
      showToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle swap complete
  const handleSwapComplete = async (transactionId?: string) => {
    console.log('[CheckIn] ✅ Swap completed, transactionId:', transactionId);
    
    // Refresh inventory after swap completion
    // This ensures inventory count is updated (battery removed from station)
    try {
      // Trigger a custom event that inventory page can listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('inventory-refresh'));
        console.log('[CheckIn] ✅ Dispatched inventory-refresh event');
      }
    } catch (error) {
      console.warn('[CheckIn] ⚠️ Failed to dispatch inventory refresh event:', error);
    }
    
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
      {step === 'verify' && reservationId && (
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

      {step === 'swap' && swapTransactionId ? (
        <SwapStep
          bookingData={bookingData}
          driverName={driverName}
          swapTransactionId={swapTransactionId}
          onComplete={handleSwapComplete}
          onBack={() => goToVerify()}
          onCancel={handleSwapCancel}
        />
      ) : step === 'swap' ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Swap Transaction Not Found</p>
          <p className="text-sm text-gray-600 mb-4">
            Please verify booking first to create swap transaction.
          </p>
          <button
            onClick={() => goToVerify()}
            className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            ← Go Back to Verify
          </button>
        </div>
      ) : null}

      {step === 'completed' && (
        <CompletedStep
          driverName={driverName}
          onReset={handleReset}
        />
      )}
    </div>
  );
}


