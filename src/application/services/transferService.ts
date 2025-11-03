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

    const res = await fetch(TransferAPI.create, { method: 'POST', headers, body: JSON.stringify(payload), credentials: 'same-origin' });
    const payloadRes = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payloadRes?.message || 'Failed to create transfer');
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
