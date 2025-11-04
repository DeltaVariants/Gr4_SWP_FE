"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { Table } from '../components/Table';
import { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/presentation/components/ui/Notification/ToastProvider';
import { useAuth } from '@/contexts/AuthContext';
import batteryService from '@/application/services/batteryService';
import bookingService from '@/application/services/bookingService';
import { Battery, BatteryCharging, BatteryWarning, AlertTriangle, CheckCircle2, Clock, Grid3x3, List, Zap, Box } from 'lucide-react';

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    Full: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Charging: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    Faulty: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    Reserved: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Available: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[value] || 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'}`}>
      {value}
    </span>
  );
}

function BatteryCard({ 
  battery, 
  onUpdate 
}: { 
  battery: Record<string, unknown>; 
  onUpdate: (b: Record<string, unknown>) => void;
}) {
  const status = String(battery['status'] || 'Unknown');
  const id = String(battery['id'] || '');
  const type = String(battery['type'] || '—');

  const statusConfig: Record<string, { icon: any; gradient: string; iconColor: string }> = {
    Full: { 
      icon: Battery, 
      gradient: 'from-emerald-500 to-teal-600',
      iconColor: 'text-emerald-600'
    },
    Charging: { 
      icon: BatteryCharging, 
      gradient: 'from-blue-500 to-indigo-600',
      iconColor: 'text-blue-600'
    },
    Faulty: { 
      icon: BatteryWarning, 
      gradient: 'from-rose-500 to-red-600',
      iconColor: 'text-rose-600'
    },
    Available: {
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-600',
      iconColor: 'text-green-600'
    },
    Reserved: {
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      iconColor: 'text-amber-600'
    }
  };

  const config = statusConfig[status] || { icon: Battery, gradient: 'from-gray-400 to-gray-500', iconColor: 'text-gray-600' };
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <StatusBadge value={status} />
      </div>
      
      <div className="space-y-2 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Battery ID</div>
          <div className="font-mono font-bold text-gray-900">{id}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Type</div>
          <div className="text-sm font-medium text-gray-700">{type}</div>
        </div>
      </div>

      <button
        onClick={() => onUpdate(battery)}
        className="w-full h-9 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
      >
        Cập nhật trạng thái
      </button>
    </div>
  );
}

function UpdateActions({ row, onOpen }: { row: Record<string, unknown>; onOpen: (r: Record<string, unknown>) => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onOpen(row)} className="text-xs px-3 py-1.5 rounded-md bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">Mark Faulty</button>
      <button onClick={() => onOpen(row)} className="text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100">In Service</button>
    </div>
  );
}

// NOTE: columns need access to onOpen handler so they are defined inside the component

const initialData: Record<string, unknown>[] = [];

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Full', value: 'Full' },
  { label: 'Charging', value: 'Charging' },
  { label: 'Faulty', value: 'Faulty' },
  { label: 'Available', value: 'Available' },
  { label: 'Reserved', value: 'Reserved' },
];

export default withStaffAuth(function InventoryPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [data, setData] = useState<Record<string, unknown>[]>(initialData);
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'slots'>('slots');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get stationId from user
        const u = user as Record<string, unknown> | null;
        let stationId = undefined as string | undefined;
        
        if (u) {
          stationId = (
            u['stationId'] || 
            u['StationID'] || 
            u['stationID'] || 
            u['StationId'] ||
            u['stationName'] ||
            u['StationName']
          ) as string | undefined;
        }

        // Fallback to /api/auth/me if no stationId
        if (!stationId && typeof window !== 'undefined') {
          try {
            const token = localStorage.getItem('accessToken');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            
            const meRes = await fetch('/api/auth/me', { cache: 'no-store', headers });
            const mePayload = await meRes.json().catch(() => ({}));
            
            if (meRes.ok && mePayload?.success && mePayload.data) {
              const d = mePayload.data as Record<string, unknown>;
              stationId = (
                d['stationId'] || 
                d['StationID'] || 
                d['stationID'] || 
                d['StationId'] ||
                d['stationName'] ||
                d['StationName']
              ) as string | undefined;
            }
          } catch (e) {
            console.error('Error fetching /api/auth/me:', e);
          }
        }

        console.log('[Inventory] Using stationId:', stationId);

        // Load batteries (all for table view)
        const list = await batteryService.getAllBatteries();
        // Map backend DTOs to table rows (defensive mapping)
        function getFirstString(obj: Record<string, unknown>, keys: string[], fallback = '—') {
          for (const k of keys) {
            const v = obj[k];
            if (typeof v === 'string' && v) return v;
            if (typeof v === 'number') return String(v);
          }
          return fallback;
        }

        const rows = (list || []).map((b: Record<string, unknown>) => ({
          id: getFirstString(b, ['batteryID', 'id', 'BatteryID', 'BatteryCode', 'code']),
          type: getFirstString(b, ['batteryType', 'type', 'model', 'BatteryType', 'Type']),
          status: getFirstString(b, ['status', 'Status', 'batteryStatus'], 'Unknown'),
          raw: b,
        }));
        if (mounted) setData(rows);

        // TODO: Load battery slots - Currently disabled due to backend permission/availability
        // Uncomment when backend provides access to /battery-slots endpoint
        /*
        if (stationId) {
          try {
            const slotsData = await batteryService.getAllBatterySlotsByStationID(stationId);
            console.log('[Inventory] Slots data:', slotsData);
            if (mounted) setSlots(Array.isArray(slotsData) ? slotsData : []);
          } catch (e: any) {
            console.warn('[Inventory] ⚠️ Could not load slots:', e?.message);
            if (mounted) setSlots([]);
          }

          // Load bookings to check which slots are booked
          try {
            const bookingsData = await bookingService.getAllBookingOfStation(stationId);
            console.log('[Inventory] Bookings data:', bookingsData);
            if (mounted) setBookings(Array.isArray(bookingsData) ? bookingsData : []);
          } catch (e) {
            console.error('Error loading bookings:', e);
          }
        }
        */
      } catch (e: unknown) {
        console.error('Load batteries error:', e);
        if (mounted) {
          const msg = (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) ? String((e as Record<string, unknown>)['message']) : 'Failed to load batteries';
          setError(msg);
          
          // If token expired error, show specific message
          if (msg.includes('hết hạn') || msg.includes('expired') || msg.includes('401')) {
            toast.showToast({ 
              message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 
              type: 'error' 
            });
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, toast]);

  const filtered = useMemo(() => {
    let items = data || [];
    if (status) items = items.filter((d) => String((d as Record<string, unknown>)['status']) === status);
    const s = q.trim().toLowerCase();
    if (s) {
      items = items.filter((d) => (String((d as Record<string, unknown>)['id'] || '')).toLowerCase().includes(s) || (String((d as Record<string, unknown>)['type'] || '')).toLowerCase().includes(s));
    }
    return items;
  }, [status, q, data]);

  // columns are created here so they can close over handlers like onOpen
  const onOpen = (row: Record<string, unknown>) => {
    setSelected(row);
  setNewStatus(String(row['status'] || '') || '');
    setReason('');
    setModalOpen(true);
  };

  const columnsLocal = [
    { key: 'id', header: 'Battery ID' },
    { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status', render: (row: Record<string, unknown>) => <StatusBadge value={String(row['status'] || '')} /> },
    { key: 'actions', header: '', render: (row: Record<string, unknown>) => (
      <UpdateActions row={row} onOpen={onOpen} />
    ) },
  ];

  const handleConfirm = async () => {
    if (!selected) return;
  const id = String((selected as Record<string, unknown>)['id'] || (selected as Record<string, unknown>)['batteryID'] || (String(((selected as Record<string, unknown>)['raw'] as Record<string, unknown>)?.['batteryID'] || '') || ''));
    const payload = { batteryId: id, status: newStatus, reason: reason || undefined };
    try {
      toast.showToast({ message: 'Updating battery status...', type: 'info' });
      await batteryService.updateBatteryStatus(payload);
      // optimistic update locally
  setData((prev) => prev.map((r) => (String(r['id']) === String(selected?.['id']) ? { ...(r as Record<string, unknown>), status: newStatus, reason } : r)));
      setModalOpen(false);
      toast.showToast({ message: 'Battery status updated', type: 'success' });
    } catch (e: unknown) {
      console.error('Update battery status error', e);
      const msg = (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) ? String((e as Record<string, unknown>)['message']) : 'Failed to update status';
      toast.showToast({ message: msg, type: 'error' });
    }
  };
  // Stats
  const fullCount = data.filter(d => d['status'] === 'Full' || d['status'] === 'Available').length;
  const chargingCount = data.filter(d => d['status'] === 'Charging').length;
  const faultyCount = data.filter(d => d['status'] === 'Faulty').length;
  const totalCount = data.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 font-medium mb-1">Tổng số pin</div>
              <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white">
              <Battery className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Sẵn sàng</div>
              <div className="text-3xl font-bold text-emerald-900">{fullCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-medium mb-1">Đang sạc</div>
              <div className="text-3xl font-bold text-blue-900">{chargingCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <BatteryCharging className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-rose-700 font-medium mb-1">Lỗi</div>
              <div className="text-3xl font-bold text-rose-900">{faultyCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 px-4 rounded-lg border-2 border-gray-200 text-sm text-black font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Battery className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Tìm theo ID hoặc loại..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 w-full sm:w-64 pl-10 pr-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('slots')}
                className={`h-8 px-3 rounded flex items-center justify-center gap-1 transition-all ${
                  viewMode === 'slots' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Slots View"
              >
                <Box className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Slots</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`h-8 w-8 rounded flex items-center justify-center transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`h-8 w-8 rounded flex items-center justify-center transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
          <Zap className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách pin...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-700 rounded-xl shadow-sm border border-rose-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      ) : (
        <>
          {viewMode === 'slots' ? (
            <div className="space-y-4">
              {/* Slots View */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Battery Slots</h3>
                    <p className="text-sm text-gray-600">Tổng số: {slots.length} slots</p>
                  </div>
                </div>

                {slots.length === 0 ? (
                  <div className="p-12 text-center">
                    <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không có slots nào cho trạm này</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {slots.map((slot: any, idx: number) => {
                      const slotNum = slot.slotNumber || slot.SlotNumber || slot.slotNum || idx + 1;
                      const batteryId = slot.batteryID || slot.BatteryID || slot.batteryId;
                      const slotStatus = slot.status || slot.Status || 'Unknown';
                      
                      // Check if this slot is booked
                      const isBooked = bookings.some((b: any) => {
                        const bookingSlot = b.slotNumber || b.SlotNumber;
                        const bookingStatus = b.status || b.Status || b.bookingStatus;
                        return bookingSlot === slotNum && 
                               (bookingStatus === 'Confirmed' || bookingStatus === 'Pending' || bookingStatus === 'Active');
                      });

                      const isEmpty = !batteryId || batteryId === 'null' || batteryId === '';
                      
                      let bgColor = 'bg-gray-100';
                      let borderColor = 'border-gray-300';
                      let textColor = 'text-gray-600';
                      let icon = <Battery className="w-5 h-5" />;
                      let statusLabel = 'Trống';

                      if (!isEmpty) {
                        // Has battery
                        if (slotStatus === 'Full' || slotStatus === 'Available') {
                          bgColor = 'bg-gradient-to-br from-emerald-50 to-teal-50';
                          borderColor = 'border-emerald-400';
                          textColor = 'text-emerald-700';
                          icon = <Battery className="w-5 h-5 text-emerald-600" />;
                          statusLabel = 'Đầy';
                        } else if (slotStatus === 'Charging') {
                          bgColor = 'bg-gradient-to-br from-blue-50 to-indigo-50';
                          borderColor = 'border-blue-400';
                          textColor = 'text-blue-700';
                          icon = <BatteryCharging className="w-5 h-5 text-blue-600" />;
                          statusLabel = 'Đang sạc';
                        } else if (slotStatus === 'Faulty') {
                          bgColor = 'bg-gradient-to-br from-rose-50 to-red-50';
                          borderColor = 'border-rose-400';
                          textColor = 'text-rose-700';
                          icon = <BatteryWarning className="w-5 h-5 text-rose-600" />;
                          statusLabel = 'Lỗi';
                        } else {
                          bgColor = 'bg-gradient-to-br from-gray-50 to-slate-50';
                          borderColor = 'border-gray-400';
                          textColor = 'text-gray-700';
                          icon = <Battery className="w-5 h-5 text-gray-600" />;
                          statusLabel = slotStatus;
                        }
                      }

                      if (isBooked) {
                        borderColor = 'border-amber-500 ring-2 ring-amber-200';
                      }

                      return (
                        <div
                          key={slotNum}
                          className={`relative ${bgColor} rounded-xl p-4 border-2 ${borderColor} transition-all hover:shadow-lg group`}
                        >
                          {isBooked && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                              <Clock className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                              {icon}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-gray-900">Slot {slotNum}</div>
                              <div className={`text-[10px] font-semibold ${textColor}`}>{statusLabel}</div>
                              
                              {!isEmpty && (
                                <div className="text-[9px] font-mono text-gray-500 truncate max-w-full">
                                  {String(batteryId).substring(0, 8)}
                                </div>
                              )}
                              
                              {isBooked && (
                                <div className="text-[9px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                  Đã đặt
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400"></div>
                    <span className="text-xs text-gray-700">Sẵn sàng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400"></div>
                    <span className="text-xs text-gray-700">Đang sạc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
                    <span className="text-xs text-gray-700">Trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-400"></div>
                    <span className="text-xs text-gray-700">Lỗi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white border-2 border-amber-500 ring-2 ring-amber-200"></div>
                    <span className="text-xs text-gray-700">Đang được đặt</span>
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-full p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
                  <Battery className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Không tìm thấy pin nào</p>
                </div>
              ) : (
                filtered.map((battery) => (
                  <BatteryCard
                    key={String(battery['id'])}
                    battery={battery}
                    onUpdate={onOpen}
                  />
                ))
              )}
            </div>
          ) : (
            <Table columns={columnsLocal} data={filtered} empty={<span className="text-sm text-gray-500">No batteries match your filters</span>} />
          )}

          {/* Modal: Update Battery Status */}
          {modalOpen && selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
              <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                    <Battery className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cập nhật trạng thái</h3>
                    <p className="text-sm text-gray-600">Thay đổi trạng thái pin</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Battery ID</div>
                  <div className="font-mono font-bold text-gray-900">{String(selected?.['id'] || '')}</div>
                  {String(selected?.['type'] || '') && (
                    <>
                      <div className="text-xs text-gray-600 mt-2 mb-1">Type</div>
                      <div className="text-sm font-medium text-gray-700">{String(selected?.['type'] || '')}</div>
                    </>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái mới</label>
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)} 
                      className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="Full">✓ Full - Đầy, sẵn sàng</option>
                      <option value="Available">✓ Available - Khả dụng</option>
                      <option value="Charging">⚡ Charging - Đang sạc</option>
                      <option value="Reserved">⏳ Reserved - Đã đặt trước</option>
                      <option value="Faulty">⚠ Faulty - Lỗi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
                    <textarea 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)} 
                      placeholder="Nhập lý do hoặc ghi chú..." 
                      className="w-full rounded-lg border-2 border-gray-200 p-3 text-sm h-24 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleConfirm} 
                    disabled={!newStatus}
                    className="flex-1 h-11 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});
