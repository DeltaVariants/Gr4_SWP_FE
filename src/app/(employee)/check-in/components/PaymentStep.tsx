/**
 * PaymentStep Component
 * Step 3: Process payment
 */

import { useState, useEffect } from 'react';
import {
  Wallet,
  User,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { PaymentStepProps } from './types';
import { usePayment } from '@/presentation/hooks/usePayment';
import { useSwapTransaction } from '@/presentation/hooks/useSwapTransaction';
import { useToast } from '@/presentation/components/ui/Notification';
import { persistCheckInState } from '../utils/checkInPersistence';

export function PaymentStep({
  bookingData,
  driverName,
  swapTransactionId,
  stationId,
  onComplete,
  onBack,
}: PaymentStepProps) {
  const { showToast } = useToast();
  const { loadSwapTransactionByBooking } = useSwapTransaction();
  const {
    paymentMethod,
    paymentUrl,
    qrCodeUrl,
    step: paymentStep,
    loading: paymentLoading,
    error: paymentError,
    selectPaymentMethod,
    createPayment,
  } = usePayment();

  const [transactionID, setTransactionID] = useState<string | null>(swapTransactionId);
  const [loadingSwapTx, setLoadingSwapTx] = useState(false);

  // Load SwapTransaction if not available yet
  useEffect(() => {
    if (!swapTransactionId && bookingData?.bookingID) {
      loadSwapTxData();
    }
  }, [bookingData, swapTransactionId]);

  const loadSwapTxData = async () => {
    if (!bookingData?.bookingID) return;

    try {
      setLoadingSwapTx(true);
      const txId = await loadSwapTransactionByBooking(bookingData.bookingID);

      if (txId) {
        setTransactionID(txId);
        console.debug('[PaymentStep] TransactionID:', txId);
      } else {
        console.warn('[PaymentStep] No transaction found. Booking may not be confirmed yet.');
        showToast({
          type: 'error',
          message: 'Booking not confirmed yet. Please go back to verify step.',
        });
      }
    } catch (error) {
      console.error('[PaymentStep] Failed to load transaction:', error);
      showToast({
        type: 'error',
        message: 'Failed to load transaction information',
      });
    } finally {
      setLoadingSwapTx(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!transactionID) {
      showToast({ type: 'error', message: 'Transaction ID not found' });
      return;
    }

    // CRITICAL: Save state before redirecting to PayOS
    // When user returns from PayOS, state will be restored
    console.log('[PaymentStep] Saving state before payment redirect...');
    persistCheckInState({
      step: 'payment',
      reservationId: bookingData?.bookingID || '',
      bookingData: bookingData,
      driverName: driverName,
      vehicle: (bookingData as any)?.vehicleId || '',
      batteryType: bookingData?.batteryType || '',
      swapTransactionId: transactionID,
    });

    const success = await createPayment(transactionID);
    if (!success) {
      console.error('[PaymentStep] Failed to create payment');
    }
  };

  const handleSkipPayment = () => {
    showToast({ type: 'success', message: '✅ Payment completed! Proceeding to swap...' });
    onComplete();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-4 shadow-lg">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
        <p className="text-gray-600">
          Customer: <span className="font-semibold">{driverName}</span>
        </p>
      </div>

      {/* Loading SwapTransaction */}
      {loadingSwapTx && (
        <div className="py-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading transaction information...</p>
        </div>
      )}

      {/* Step 1: Select Payment Method */}
      {!loadingSwapTx && paymentStep === 'select' && (
        <div className="max-w-md mx-auto space-y-6">
          {/* Customer Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">
              Payment Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">{driverName}</span>
              </div>
              {(bookingData as any)?.amount && (
                <div className="text-center pt-2 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {(bookingData as any).amount.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Payment Method
            </label>

            <button
              onClick={() => selectPaymentMethod('PayOS')}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                paymentMethod === 'PayOS'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  paymentMethod === 'PayOS' ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              >
                <QrCode
                  className={`w-6 h-6 ${paymentMethod === 'PayOS' ? 'text-white' : 'text-gray-600'}`}
                />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">PayOS</div>
                <div className="text-sm text-gray-600">Scan QR code to pay</div>
              </div>
              {paymentMethod === 'PayOS' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            </button>
          </div>

          {/* Error Message */}
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Payment Error</p>
                <p className="text-sm text-red-700 mt-1">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onBack}
              className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              ← Back
            </button>
            <button
              onClick={handleCreatePayment}
              disabled={!paymentMethod || !transactionID || paymentLoading}
              className="flex-1 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title={!transactionID ? 'Loading Transaction ID...' : ''}
            >
              <CreditCard className="w-5 h-5" />
              Create Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Processing */}
      {paymentStep === 'processing' && paymentLoading && (
        <div className="py-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Creating payment code...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
        </div>
      )}

      {/* Step 3: Show QR Code */}
      {paymentStep === 'qr' && qrCodeUrl && (
        <div className="max-w-md mx-auto space-y-6">
          {/* Success Alert */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-900">Payment code created!</p>
              <p className="text-sm text-emerald-700">Click on QR or button below to pay</p>
            </div>
          </div>

          {/* Customer Name */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <User className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">{driverName}</span>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300">
            <a
              href={paymentUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="bg-white p-4 rounded-lg shadow-lg mb-4 hover:shadow-xl transition-shadow">
                <img src={qrCodeUrl} alt="Payment QR Code" className="w-full h-auto" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-700 mb-1">
                  👆 Click on QR to open payment page
                </p>
                <p className="text-xs text-gray-600">or scan with banking app</p>
              </div>
            </a>
          </div>

          {/* Open Payment Button */}
          {paymentUrl && (
            <a href={paymentUrl || undefined} target="_blank" rel="noopener noreferrer" className="block w-full">
              <button className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                <CreditCard className="w-6 h-6" />
                Open Payment Page
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          )}

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              <strong>After successful payment</strong>, the system will automatically proceed to swap step
            </p>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSkipPayment}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              Payment Completed → Continue Swap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

