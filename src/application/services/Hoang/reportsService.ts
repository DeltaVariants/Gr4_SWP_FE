const ReportsAPI = {
  usage: '/api/reports/usage',
  revenue: '/api/reports/revenue',
};

const reportsService = {
  async getStationUsageReport(payload: any) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const res = await fetch(ReportsAPI.usage, { method: 'POST', headers, body: JSON.stringify(payload), credentials: 'same-origin' });
    const payloadRes = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payloadRes?.message || 'Failed to fetch usage report');
    return payloadRes?.data || payloadRes;
  },

  async getRevenueReportInDay(query?: Record<string,string>) {
    const headers: Record<string, string> = {};
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {}

    const qs = query ? '?' + new URLSearchParams(query).toString() : '';
    const res = await fetch(`${ReportsAPI.revenue}${qs}`, { headers, credentials: 'same-origin' });
    const payloadRes = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      // 403 = Permission denied (backend may require Admin role for reports)
      if (res.status === 403) {
        console.warn('[reportsService] ⚠️ Revenue report: Permission denied (403). This feature may require Admin role.');
        throw new Error('Bạn không có quyền truy cập báo cáo doanh thu. Vui lòng liên hệ Admin.');
      }
      
      console.error('[reportsService] Revenue report failed:', {
        status: res.status,
        statusText: res.statusText,
        response: payloadRes,
        backend: payloadRes?.backend,
        message: payloadRes?.message
      });
      
      throw new Error(payloadRes?.message || payloadRes?.error || `HTTP ${res.status}: Failed to fetch revenue report`);
    }
    
    return payloadRes?.data || payloadRes;
  }
};

export default reportsService;

