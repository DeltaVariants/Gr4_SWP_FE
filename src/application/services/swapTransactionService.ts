/**
 * Swap Transaction Service
 * Handles swap transaction operations (customer battery swap flow)
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gr4-swp-be2-sp25.onrender.com/api';

const SwapTransactionAPI = {
  getAll: `${BACKEND_URL}/swap-transactions`,
  getById: (id: string) => `${BACKEND_URL}/swap-transactions/${id}`,
  complete: (id: string) => `${BACKEND_URL}/swap-transactions/${id}/completed`,
};

const swapTransactionService = {
  /**
   * Get all swap transactions
   */
  async getAllSwapTransactions() {
    const headers: Record<string, string> = {};
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const res = await fetch(SwapTransactionAPI.getAll, {
      method: 'GET',
      headers,
      credentials: 'same-origin',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch swap transactions');
    }
    return data?.data || data;
  },

  /**
   * Get swap transaction by ID
   */
  async getSwapTransactionById(id: string) {
    const headers: Record<string, string> = {};
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const res = await fetch(SwapTransactionAPI.getById(id), {
      method: 'GET',
      headers,
      credentials: 'same-origin',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to fetch swap transaction');
    }
    return data?.data || data;
  },

  /**
   * Complete a swap transaction
   * This creates and completes the transaction in one call
   * Backend auto-handles:
   * - Create battery-transfers (OUT old, IN new)
   * - Update battery-slots
   * - Update batteries status
   */
  async completeSwapTransaction(id: string, payload: {
    oldBatteryID: string;
    newBatteryID: string;
    stationID: string;
    customerID?: string;
    bookingID?: string;
  }) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    console.log('[SwapTransactionService] Completing swap:', {
      url: SwapTransactionAPI.complete(id),
      payload,
      payloadStringified: JSON.stringify(payload),
      payloadKeys: Object.keys(payload),
      payloadValues: Object.values(payload),
      hasToken: !!headers['Authorization'],
    });

    const res = await fetch(SwapTransactionAPI.complete(id), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    });

    const data = await res.json().catch(() => ({}));

    console.log('[SwapTransactionService] Response:', {
      status: res.status,
      ok: res.ok,
      data,
    });

    if (!res.ok) {
      // Log chi tiết error để debug
      console.error('[SwapTransactionService] ❌ Swap failed:', {
        status: res.status,
        statusText: res.statusText,
        url: SwapTransactionAPI.complete(id),
        payload,
        transactionId: id,
        message: data?.message,
        errors: data?.errors,
        error: data?.error,
        fullResponse: data,
      });

      // Extract error message từ response
      const errorMsg =
        data?.message ||
        data?.errors?.[0]?.msg ||
        data?.error ||
        data?.errors?.[0]?.message ||
        `HTTP ${res.status}: Failed to complete swap transaction`;

      // Tạo error object với thông tin chi tiết
      const error = new Error(errorMsg) as any;
      error.status = res.status;
      error.statusText = res.statusText;
      error.response = data;
      error.url = SwapTransactionAPI.complete(id);
      error.payload = payload;
      error.transactionId = id;

      throw error;
    }

    return data?.data || data;
  },
};

export default swapTransactionService;
