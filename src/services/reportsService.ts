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
    const qs = query ? '?' + new URLSearchParams(query).toString() : '';
    const res = await fetch(`${ReportsAPI.revenue}${qs}`, { credentials: 'same-origin' });
    const payloadRes = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payloadRes?.message || 'Failed to fetch revenue report');
    return payloadRes?.data || payloadRes;
  }
};

export default reportsService;
