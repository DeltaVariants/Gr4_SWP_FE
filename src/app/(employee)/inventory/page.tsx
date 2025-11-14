"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/presentation/components/ui/Notification';
import { useAuth } from '@/contexts/AuthContext';
import { useBatteries } from '@/presentation/hooks/useBatteries';
import { useBatterySlots } from '@/presentation/hooks/useBatterySlots';
import { useBookings } from '@/presentation/hooks/useBookings';
import { Battery, BatteryCharging, BatteryWarning, AlertTriangle, CheckCircle2, Clock, Grid3x3, Zap, Box, Package } from 'lucide-react';

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, { style: string; label: string }> = {
    Available: { 
      style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      label: '✓ Available'
    },
    Damaged: { 
      style: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
      label: '⚠ Damaged'
    },
  };
  
  const config = map[value] || { 
    style: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    label: value || 'Unknown'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}>
      {config.label}
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
    Available: {
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600',
      iconColor: 'text-emerald-600'
    },
    Damaged: { 
      icon: BatteryWarning, 
      gradient: 'from-rose-500 to-red-600',
      iconColor: 'text-rose-600'
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
        Update Status
      </button>
    </div>
  );
}

const initialData: Record<string, unknown>[] = [];

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: '✓ Available', value: 'Available' },
  { label: '⚠ Damaged', value: 'Damaged' },
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
  const [viewMode, setViewMode] = useState<'grid' | 'slots'>('slots');

  // Get stationId from user (MUST be GUID, not station name)
  const stationId = user?.stationId;

  // Use custom hook to fetch batteries and inventory
  const { batteries, inventory, loading, error, refetch, updateStatus } = useBatteries(stationId);
  
  // Use custom hook to fetch battery slots
  const { slots: batterySlots, loading: slotsLoading, error: slotsError, refetch: refetchSlots } = useBatterySlots(stationId);
  
  // Use custom hook to fetch bookings for this station (to check if slots are booked)
  const { bookings, loading: bookingsLoading } = useBookings(stationId, { autoLoad: true });
  

  // Show error toast if any
  useEffect(() => {
    if (error) {
      toast.showToast({ 
        message: error.message || 'Failed to load batteries', 
        type: 'error' 
      });
    }
  }, [error, toast]);

  // Transform batteries to table data
  const data = useMemo(() => {
    return batteries.map((b) => ({
      id: b.batteryID || b.batteryId,           // Use batteryID (GUID) for API calls
      displayId: b.batteryCode || b.batteryID,  // Use batteryCode for display
      type: b.batteryType || '—',
      status: b.status || 'Unknown',
      raw: b,
    }));
  }, [batteries]);

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


  const handleConfirm = async () => {
    if (!selected) return;
    const id = String((selected as Record<string, unknown>)['id'] || (selected as Record<string, unknown>)['batteryID'] || (String(((selected as Record<string, unknown>)['raw'] as Record<string, unknown>)?.['batteryID'] || '') || ''));
    const oldStatus = String((selected as Record<string, unknown>)['status'] || '');
    const payload = { 
      batteryId: id, 
      status: newStatus as 'Available' | 'In-Use' | 'Charging' | 'Maintenance' | 'Damaged', 
      reason: reason || undefined,
      oldStatus: oldStatus || undefined // Truyền oldStatus để logic backend biết cách xử lý
    };
    try {
      toast.showToast({ message: 'Updating battery status...', type: 'info' });
      await updateStatus(payload);
      setModalOpen(false);
      toast.showToast({ message: 'Battery status updated', type: 'success' });
    } catch (e: unknown) {
      console.error('Update battery status error', e);
      const msg = (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) ? String((e as Record<string, unknown>)['message']) : 'Failed to update status';
      toast.showToast({ message: msg, type: 'error' });
    }
  };
  // Stats - use inventory data from hook if available, otherwise calculate from batteries
  const availableCount = inventory?.available || data.filter(d => d['status'] === 'Available').length;
  const damagedCount = inventory?.damaged || data.filter(d => d['status'] === 'Damaged').length;
  const totalCount = inventory?.total || data.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 font-medium mb-1">Total Batteries</div>
              <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white">
              <Battery className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700 font-medium mb-1">Available Batteries</div>
              <div className="text-3xl font-bold text-emerald-900">{availableCount}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 border border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-rose-700 font-medium mb-1">Damaged Batteries</div>
              <div className="text-3xl font-bold text-rose-900">{damagedCount}</div>
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
                placeholder="Search by ID or type..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10 w-full sm:w-64 pl-10 pr-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
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
                onClick={() => setViewMode('slots')}
                className={`h-8 w-8 rounded flex items-center justify-center transition-all ${
                  viewMode === 'slots' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Slots View"
              >
                <Package className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
          <Zap className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading batteries...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 text-rose-700 rounded-xl shadow-sm border border-rose-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>{error.message || 'An error occurred'}</span>
        </div>
      ) : (
        <>
          {viewMode === 'slots' ? (
            slotsLoading ? (
              <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
                <Zap className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
                <p className="text-gray-600">Loading battery slots...</p>
              </div>
            ) : slotsError ? (
              <div className="p-6 bg-rose-50 text-rose-700 rounded-xl shadow-sm border border-rose-200 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span>{slotsError.message || 'Failed to load battery slots'}</span>
              </div>
            ) : batterySlots.length === 0 ? (
              <div className="p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
                <Box className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No battery slots found</p>
              </div>
            ) : (
              <>
                {/* Slot Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Total Slots</div>
                    <div className="text-2xl font-bold text-gray-900">{batterySlots.length}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Occupied Slots</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {batterySlots.filter(s => s.status === 'Occupied' || s.status === 'Charging').length}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">Empty Slots</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {batterySlots.filter(s => s.status === 'Empty').length}
                    </div>
                  </div>
                </div>

                {/* Slot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {batterySlots.map((slot) => {
                    const slotStatus = slot.status || 'Empty';
                    
                    // Tìm booking cho slot này thông qua batteryID
                    // Note: Booking có thể không có batteryID trong response, cần check backend DTO
                    const slotBooking = slot.batteryID 
                      ? bookings.find(b => {
                          // Thử nhiều cách để tìm batteryID trong booking
                          const bookingBatteryId = (b as any).batteryID || 
                                                   (b as any).batteryId || 
                                                   (b as any).battery_id ||
                                                   (b as any).newBatteryID ||
                                                   (b as any).newBatteryId;
                          const slotBatteryId = slot.batteryID || slot.batteryCode;
                          return bookingBatteryId && (
                            bookingBatteryId === slotBatteryId || 
                            bookingBatteryId === slot.batteryCode ||
                            bookingBatteryId === slot.batteryID
                          );
                        })
                      : null;
                    
                    // ✅ Use new format: status (lowercase)
                    const isBooked = slotBooking && 
                      (slotBooking.status === 'pending' || 
                       (slotBooking as any).status === 'confirmed');
                    
                    const statusConfig: Record<string, { icon: any; gradient: string; label: string }> = {
                      Empty: {
                        icon: Box,
                        gradient: 'from-gray-400 to-gray-500',
                        label: 'Empty'
                      },
                      Occupied: {
                        icon: Battery,
                        gradient: 'from-blue-500 to-blue-600',
                        label: 'Occupied'
                      },
                      Charging: {
                        icon: BatteryCharging,
                        gradient: 'from-emerald-500 to-teal-600',
                        label: 'Charging'
                      },
                      Maintenance: {
                        icon: BatteryWarning,
                        gradient: 'from-amber-500 to-orange-600',
                        label: 'Maintenance'
                      },
                      Error: {
                        icon: AlertTriangle,
                        gradient: 'from-rose-500 to-red-600',
                        label: 'Error'
                      }
                    };
                    const config = statusConfig[slotStatus] || statusConfig['Empty'];
                    const Icon = config.icon;
                    
                    return (
                      <div 
                        key={slot.batterySlotID} 
                        className={`bg-white rounded-xl p-5 border transition-all ${
                          isBooked 
                            ? 'border-purple-300 hover:border-purple-400 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-0.5">Slot</div>
                            <div className="text-lg font-bold text-gray-900">#{slot.slotNumber}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-0.5">Status</div>
                            <div className={`text-sm font-semibold ${
                              slotStatus === 'Empty' ? 'text-gray-600' :
                              slotStatus === 'Occupied' ? 'text-blue-600' :
                              slotStatus === 'Charging' ? 'text-emerald-600' :
                              slotStatus === 'Maintenance' ? 'text-amber-600' :
                              'text-rose-600'
                            }`}>
                              {config.label}
                            </div>
                          </div>
                          {slot.batteryID && (
                            <div>
                              <div className="text-xs text-gray-500 mb-0.5">Battery ID</div>
                              <div className="font-mono text-sm font-bold text-gray-900">{slot.batteryCode || slot.batteryID}</div>
                            </div>
                          )}
                          {isBooked && slotBooking && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <div>
                                  <div className="text-xs text-purple-600 font-semibold">Booked</div>
                                  <div className="text-xs text-gray-500">
                                    {slotBooking.userName || 'Driver'}  {/* ✅ Use userName */}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {slotBooking.status}  {/* ✅ Use status */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-full p-12 bg-white rounded-xl shadow-sm text-center border border-gray-100">
                  <Battery className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No batteries found</p>
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
                    <h3 className="text-xl font-bold text-gray-900">Update Status</h3>
                    <p className="text-sm text-gray-600">Change battery status</p>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)} 
                      className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Available">✓ Available - Battery ready to use</option>
                      <option value="Charging">🔋 Charging - Battery is charging</option>
                      <option value="Damaged">⚠ Damaged - Battery needs repair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                    <textarea 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)} 
                      placeholder="Enter reason or notes..." 
                      className="w-full rounded-lg border-2 border-gray-200 p-3 text-sm h-24 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirm} 
                    disabled={!newStatus}
                    className="flex-1 h-11 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm
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

