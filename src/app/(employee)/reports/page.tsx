"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { Table } from '../components/Table';
import reportsService from '@/application/services/reportsService';
import batteryService from '@/application/services/batteryService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { TrendingUp, DollarSign, Battery, AlertTriangle, Download, Calendar, FileText, RefreshCw, CheckCircle2 } from 'lucide-react';

const LOCAL_TRANSFERS_KEY = 'localTransfers_v1';

export default withStaffAuth(function ReportsPage() {
  const [transfers, setTransfers] = useState<Record<string, unknown>[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [revenueData, setRevenueData] = useState<any>(null);
  const [batteries, setBatteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load local transfers
        const raw = localStorage.getItem(LOCAL_TRANSFERS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        setTransfers(list as Record<string, unknown>[]);

        // TODO: Load revenue data - Currently disabled due to 403 permission
        // Backend requires Admin role for /reports/daily-revenue endpoint
        // Uncomment when backend grants Staff access or provides separate endpoint
        /*
        try {
          const today = new Date().toISOString().split('T')[0];
          const revenue = await reportsService.getRevenueReportInDay({ date: today });
          setRevenueData(revenue);
        } catch (e: any) {
          console.warn('[Reports] ⚠️ Could not load revenue data:', e?.message);
          setRevenueData(null);
        }
        */

        // Load battery data
        try {
          const batteryList = await batteryService.getAllBatteries();
          setBatteries(batteryList || []);
        } catch (e) {
          console.error('Failed to load batteries:', e);
        }
      } catch (e) {
        showToast({ type: 'error', message: 'Không thể tải dữ liệu báo cáo' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showToast]);

  const filtered = useMemo(() => {
    let items = transfers.slice();
    if (statusFilter) items = items.filter((t) => (String((t as Record<string, unknown>)['status'] || '')).toLowerCase() === statusFilter.toLowerCase());
    const s = q.trim().toLowerCase();
    if (s) items = items.filter((t) => (String((t as Record<string, unknown>)['transferId'] || '')).toLowerCase().includes(s) || (String((t as Record<string, unknown>)['oldBatteryId'] || '')).toLowerCase().includes(s) || (String((t as Record<string, unknown>)['newBatteryId'] || '')).toLowerCase().includes(s));
    return items;
  }, [transfers, q, statusFilter]);

  // Calculate today's stats
  const today = new Date().toDateString();
  const todayTransfers = transfers.filter((t: any) => {
    const transferDate = new Date(t.createdAt).toDateString();
    return transferDate === today;
  });
  const completedSwaps = todayTransfers.filter(t => t.status === 'Completed').length;
  const exceptions = todayTransfers.filter(t => t.status === 'Exception' || t.status === 'Cancelled').length;
  const faultyBatteries = batteries.filter(b => b.status === 'Faulty').length;
  const totalRevenue = revenueData?.totalRevenue || revenueData?.revenue || 0;

  // Export function
  const exportReport = () => {
    const csvContent = [
      ['Transfer ID', 'Old Battery', 'New Battery', 'Status', 'Time', 'Exception Type', 'Exception Reason'],
      ...filtered.map((t: any) => [
        t.transferId || '',
        t.oldBatteryId || '',
        t.newBatteryId || '',
        t.status || '',
        new Date(t.createdAt || Date.now()).toLocaleString(),
        t.exception?.type || '',
        t.exception?.reason || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast({ type: 'success', message: 'Đã xuất báo cáo thành công!' });
  };

  const columns = [
    { key: 'transferId', header: 'Transfer ID' },
    { key: 'oldBatteryId', header: 'Old Battery' },
    { key: 'newBatteryId', header: 'New Battery' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Time', render: (r: Record<string, unknown>) => new Date((r['createdAt'] as string) || (r['created'] as string) || Date.now()).toLocaleString() },
    { key: 'details', header: 'Details', render: (r: Record<string, unknown>) => (
      <div className="text-sm text-gray-700">
        {(r['exception'] as Record<string, unknown>) ? (
          <div>
            <div className="font-medium text-rose-600">{String((r['exception'] as Record<string, unknown>)['type'] || '')}</div>
            <div className="text-xs text-gray-600">{String((r['exception'] as Record<string, unknown>)['reason'] || '')}</div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">—</div>
        )}
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Daily Summary Report</h2>
            <p className="text-purple-100">Báo cáo tổng hợp hoạt động hôm nay</p>
          </div>
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Swaps hôm nay</div>
              <div className="text-3xl font-bold text-emerald-900">{completedSwaps}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-emerald-700">Total logged: {transfers.length}</div>
        </div>

        {/* TODO: Revenue card - Hidden until backend grants Staff permission 
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-dashed border-gray-300 opacity-60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 font-medium mb-1">Doanh thu</div>
              <div className="text-2xl font-bold text-gray-400">🔒 Chưa khả dụng</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-gray-500">Yêu cầu quyền Admin</div>
        </div>
        */}

        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 border border-rose-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-rose-700 font-medium mb-1">Pin lỗi</div>
              <div className="text-3xl font-bold text-rose-900">{faultyBatteries}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white">
              <Battery className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-rose-700">Cần kiểm tra</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-amber-700 font-medium mb-1">Exceptions</div>
              <div className="text-3xl font-bold text-amber-900">{exceptions}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-xs text-amber-700">Alerts & Cancellations</div>
        </div>
      </div>

      {/* Event Log */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Event Log</h3>
              <p className="text-sm text-gray-600">Chi tiết các giao dịch đổi pin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="h-10 px-4 rounded-lg border-2 border-gray-200 text-sm text-black font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            >
              <option value="">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Exception">Exception</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input 
              placeholder="Search transfer..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              className="h-10 w-64 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all" 
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} empty={<span className="text-sm text-gray-500">No events recorded yet</span>} />
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
              <span className="font-semibold text-gray-900">
                {transfers.length > 0 ? ((completedSwaps / todayTransfers.length) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Thời gian trung bình</span>
              <span className="font-semibold text-gray-900">~5 phút</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Doanh thu/swap</span>
              <span className="font-semibold text-gray-900">
                {completedSwaps > 0 ? (totalRevenue / completedSwaps).toLocaleString() : 0} VND
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Battery Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm text-emerald-700">Full/Available</span>
              <span className="font-semibold text-emerald-900">
                {batteries.filter(b => b.status === 'Full' || b.status === 'Available').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">Charging</span>
              <span className="font-semibold text-blue-900">
                {batteries.filter(b => b.status === 'Charging').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
              <span className="text-sm text-rose-700">Faulty</span>
              <span className="font-semibold text-rose-900">{faultyBatteries}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
