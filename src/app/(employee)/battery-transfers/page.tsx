"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { useState, useEffect } from 'react';
import { useToast } from '@/presentation/components/ui/Notification';
import { useBatteryTransfers } from '@/presentation/hooks/useBatteryTransfers';
import { useAuth } from '@/contexts/AuthContext';
import { Table } from '../components/Table';
import { 
  Battery, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2,
  Search,
  RefreshCw,
  Package,
  MapPin,
  Calendar,
  Truck,
  Info
} from 'lucide-react';

function StatusBadge({ value }: { value: string }) {
  const statusLower = (value || '').toLowerCase();
  const map: Record<string, { style: string; label: string; icon: any }> = {
    'pending': { 
      style: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
      label: '⏳ Pending',
      icon: Clock
    },
    'in-transit': { 
      style: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      label: '🚚 In Transit',
      icon: ArrowRight
    },
    'completed': { 
      style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      label: '✓ Completed',
      icon: CheckCircle2
    },
    'cancelled': { 
      style: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
      label: '✕ Cancelled',
      icon: XCircle
    },
  };
  
  const config = map[statusLower] || { 
    style: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    label: value,
    icon: Package
  };
  
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default withStaffAuth(function BatteryTransfersPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [transferId, setTransferId] = useState<string>('');
  const [searchId, setSearchId] = useState<string>('');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Get current staff's station ID
  const currentStationId = user?.stationId || (user as any)?.stationID || (user as any)?.StationID;

  const {
    transfer,
    loading,
    error,
    loadTransfer,
    updateTransferStatus,
    refetch,
  } = useBatteryTransfers({
    transferId: searchId || undefined,
    autoLoad: false,
  });

  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to load transfer',
      });
    }
  }, [error, showToast]);

  const handleSearch = () => {
    if (!transferId.trim()) {
      showToast({ type: 'error', message: 'Please enter Transfer ID' });
      return;
    }
    setSearchId(transferId.trim());
    loadTransfer(transferId.trim());
  };

  const handleUpdateStatus = async () => {
    if (!searchId || !newStatus) {
      showToast({ type: 'error', message: 'Please select a status' });
      return;
    }

    // Confirmation for critical actions
    if (newStatus === 'Completed') {
      if (!window.confirm('Bạn có chắc chắn đã nhận được battery và muốn đánh dấu transfer là Completed?')) {
        return;
      }
    } else if (newStatus === 'Cancelled') {
      if (!window.confirm('Bạn có chắc chắn muốn hủy transfer này?')) {
        return;
      }
    }

    try {
      setUpdatingStatus(true);
      await updateTransferStatus(searchId, newStatus as any);
      showToast({ 
        type: 'success', 
        message: newStatus === 'Completed' 
          ? 'Transfer đã được đánh dấu hoàn tất! Battery đã được thêm vào inventory.' 
          : 'Transfer status updated successfully' 
      });
      setUpdateModalOpen(false);
      setNewStatus('');
      setNotes('');
      // Reload transfer
      await loadTransfer(searchId);
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err?.message || 'Failed to update transfer status',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick action: Mark as Delivered (Completed)
  const handleQuickComplete = async () => {
    if (!transfer || !searchId) return;
    
    if (!window.confirm('Bạn có chắc chắn đã nhận được battery và muốn đánh dấu transfer là Completed?')) {
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateTransferStatus(searchId, 'Completed');
      showToast({ 
        type: 'success', 
        message: 'Transfer đã được đánh dấu hoàn tất! Battery đã được thêm vào inventory.' 
      });
      await loadTransfer(searchId);
    } catch (err: any) {
      showToast({
        type: 'error',
        message: err?.message || 'Failed to update transfer status',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Check if transfer is coming to current staff's station
  const isTransferToMyStation = transfer && currentStationId && 
    (transfer.toStationID === currentStationId || 
     (transfer as any).ToStationID === currentStationId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Battery Transfer Management</h2>
            <p className="text-blue-100">View and update battery transfer status</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Search Transfer by ID
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Enter the Transfer ID to view and manage transfer details
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Battery className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={transferId}
              onChange={(e) => setTransferId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Transfer ID (e.g., BT-2024-001)..."
              className="w-full h-12 pl-12 pr-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !transferId.trim()}
            className="h-12 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> You can search for transfers by entering the Transfer ID. 
            If you need to view all transfers, please contact an administrator.
          </p>
        </div>
      </div>

      {/* Transfer Details */}
      {loading && searchId ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading transfer details...</p>
        </div>
      ) : error && searchId ? (
        <div className="bg-rose-50 rounded-xl shadow-sm p-6 border border-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <p className="font-semibold text-rose-900">Error</p>
              <p className="text-sm text-rose-700">{error.message || 'Failed to load transfer'}</p>
            </div>
          </div>
        </div>
      ) : transfer ? (
        <div className="space-y-4">
          {/* Alert if transfer is coming to my station */}
          {isTransferToMyStation && transfer.status === 'In-Transit' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Battery đang được chuyển đến trạm của bạn
                  </h4>
                  <p className="text-sm text-emerald-800 mb-3">
                    Battery này đang được vận chuyển đến trạm của bạn. Khi nhận được, hãy đánh dấu "Completed" để thêm vào inventory.
                  </p>
                  <button
                    onClick={handleQuickComplete}
                    disabled={updatingStatus}
                    className="h-10 px-6 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {updatingStatus ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Đánh dấu đã nhận (Completed)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-600" />
                    Transfer Details
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 font-mono">{transfer.batteryTransferID}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={transfer.status} />
                  {transfer.status !== 'Completed' && transfer.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setNewStatus(transfer.status);
                        setUpdateModalOpen(true);
                      }}
                      className="h-10 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Station Flow */}
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">From Station</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {transfer.fromStationName || transfer.fromStationID}
                    </div>
                    {transfer.fromStationID === currentStationId && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Your Station
                      </span>
                    )}
                  </div>
                  
                  <div className="px-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">To Station</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {transfer.toStationName || transfer.toStationID}
                    </div>
                    {isTransferToMyStation && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                        Your Station
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Battery className="w-4 h-4 text-gray-500" />
                      <div className="text-xs font-semibold text-gray-500 uppercase">Battery ID</div>
                    </div>
                    <div className="font-mono text-base font-bold text-gray-900">
                      {transfer.batteryCode || transfer.batteryID}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div className="text-xs font-semibold text-gray-500 uppercase">Transfer Date</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(transfer.transferDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {transfer.reason && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-xs font-semibold text-amber-700 uppercase mb-1">Reason</div>
                      <div className="text-sm text-amber-900">{transfer.reason}</div>
                    </div>
                  )}
                  {transfer.notes && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</div>
                      <div className="text-sm text-gray-700">{transfer.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : searchId ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No transfer found with ID: {searchId}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Enter a Transfer ID to search</p>
        </div>
      )}

      {/* Update Status Modal */}
      {updateModalOpen && transfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUpdateModalOpen(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Update Transfer Status</h3>
                <p className="text-sm text-gray-600">Change transfer status</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Transfer ID</div>
              <div className="font-mono font-bold text-gray-900">{transfer.batteryTransferID}</div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">-- Select Status --</option>
                  {transfer.status === 'Pending' && (
                    <>
                      <option value="In-Transit">In-Transit</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  )}
                  {transfer.status === 'In-Transit' && (
                    <>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full rounded-lg border-2 border-gray-200 p-3 text-sm h-24 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setUpdateModalOpen(false);
                  setNewStatus('');
                  setNotes('');
                }}
                className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updatingStatus}
                className="flex-1 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl flex items-center justify-center gap-2"
              >
                {updatingStatus ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

