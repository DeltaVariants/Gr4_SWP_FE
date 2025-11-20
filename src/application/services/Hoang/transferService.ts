const TransferAPI = {
  create: '/api/transfer/create',
  updateStatus: (transferId: string) => `/api/transfer/update-status/${encodeURIComponent(transferId)}`,
};

const transferService = {
  async createTransfer(payload: any) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    console.log('[TransferService] Creating transfer:', {
      url: TransferAPI.create,
      payload,
      hasToken: !!headers['Authorization']
    });

    const res = await fetch(TransferAPI.create, { method: 'POST', headers, body: JSON.stringify(payload), credentials: 'same-origin' });
    const payloadRes = await res.json().catch(() => ({}));
    
    console.log('[TransferService] Response:', {
      status: res.status,
      ok: res.ok,
      data: payloadRes
    });
    
    if (!res.ok) {
      console.error('[TransferService] ❌ Transfer failed:', {
        status: res.status,
        message: payloadRes?.message,
        errors: payloadRes?.errors,
        error: payloadRes?.error || payloadRes,
        fullResponse: payloadRes
      });
      
      // Show detailed error message
      const errorMsg = payloadRes?.message 
        || payloadRes?.errors?.[0]?.msg 
        || payloadRes?.error 
        || `HTTP ${res.status}: Failed to create transfer`;
      
      throw new Error(errorMsg);
    }
    return payloadRes?.data || payloadRes;
  },

  async updateTransferStatus(transferId: string, payload: any) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const res = await fetch(TransferAPI.updateStatus(transferId), { method: 'PUT', headers, body: JSON.stringify(payload), credentials: 'same-origin' });
    const payloadRes = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payloadRes?.message || 'Failed to update transfer');
    return payloadRes?.data || payloadRes;
  }
};

export default transferService;

