/**
 * usePayment Hook
 * Quản lý logic thanh toán
 */

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { useToast } from '@/presentation/components/ui/Notification';

type PaymentMethod = 'PayOS' | null;

interface PaymentState {
  paymentMethod: PaymentMethod;
  paymentUrl: string | null;
  orderCode: string | null;
  qrCodeUrl: string | null;
  step: 'select' | 'processing' | 'qr';
}

export function usePayment() {
  const { showToast } = useToast();
  const [state, setState] = useState<PaymentState>({
    paymentMethod: null,
    paymentUrl: null,
    orderCode: null,
    qrCodeUrl: null,
    step: 'select',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Chọn phương thức thanh toán
   */
  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    setState((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  /**
   * Tạo thanh toán mới
   */
  const createPayment = useCallback(async (transactionId: string) => {
    if (!state.paymentMethod) {
      showToast({ type: 'error', message: 'Vui lòng chọn phương thức thanh toán' });
      return false;
    }

    if (!transactionId) {
      showToast({ type: 'error', message: 'Không tìm thấy Transaction ID' });
      return false;
    }

    setState((prev) => ({ ...prev, step: 'processing' }));
    setLoading(true);
    setError(null);

    try {
      console.debug('[usePayment] Creating payment for:', transactionId);

      // Call backend
      const response = await api.post('/payment', null, {
        params: { transactionID: transactionId },
      });

      console.debug('[usePayment] Response:', response);

      // Normalize response
      const result = response.data?.data || response.data;

      // Get payment URL
      const paymentLink =
        result?.paymentUrl ||
        result?.checkoutUrl ||
        result?.url ||
        result?.paymentLink ||
        result?.checkoutLink ||
        result?.data?.paymentUrl;

      if (!paymentLink) {
        console.error('[usePayment] No payment URL in response:', result);
        throw new Error('Backend không trả về payment URL');
      }

      const code = result?.orderCode || result?.orderId || result?.paymentId || transactionId;

      // Generate QR code
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        paymentLink
      )}`;

      setState((prev) => ({
        ...prev,
        paymentUrl: paymentLink,
        orderCode: code,
        qrCodeUrl: qrUrl,
        step: 'qr',
      }));

      showToast({ type: 'success', message: '✅ Đã tạo mã thanh toán!' });
      return true;
    } catch (err: any) {
      console.error('[usePayment] Error:', err);

      // Parse error
      let errorMessage = 'Không thể tạo thanh toán';

      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorList = Object.entries(errors)
          .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        errorMessage = `Lỗi validation:\n${errorList}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setState((prev) => ({ ...prev, step: 'select' }));
      showToast({ type: 'error', message: `❌ ${errorMessage}` });
      return false;
    } finally {
      setLoading(false);
    }
  }, [state.paymentMethod, showToast]);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setState({
      paymentMethod: null,
      paymentUrl: null,
      orderCode: null,
      qrCodeUrl: null,
      step: 'select',
    });
    setError(null);
  }, []);

  return {
    // State
    ...state,
    loading,
    error,

    // Methods
    selectPaymentMethod,
    createPayment,
    resetPayment,
  };
}


