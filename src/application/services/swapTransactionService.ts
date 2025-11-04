/**
 * Swap Transaction Service
 * Handles swap transaction operations (customer battery swap flow)
 */

const SwapTransactionAPI = {
  getAll: '/api/swap-transactions',
  getById: (id: string) => `/api/swap-transactions/${id}`,
  complete: (id: string) => `/api/swap-transactions/${id}/completed`,
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
      console.error('[SwapTransactionService] ❌ Swap failed:', {
        status: res.status,
        message: data?.message,
        errors: data?.errors,
        fullResponse: data,
      });

      const errorMsg =
        data?.message ||
        data?.errors?.[0]?.msg ||
        data?.error ||
        `HTTP ${res.status}: Failed to complete swap transaction`;

      throw new Error(errorMsg);
    }

    return data?.data || data;
  },
};

export default swapTransactionService;
