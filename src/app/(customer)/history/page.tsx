'use client';

import { withCustomerAuth } from '@/hoc/withAuth';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { swapTransactionRepository } from '@/infrastructure/repositories/Hoang/SwapTransactionRepository';
import { SwapTransaction } from '@/domain/dto/Hoang/SwapTransaction';
import { 
  FaHistory, 
  FaSpinner, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaBatteryHalf,
  FaBatteryFull,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

// Status badge component
function SwapStatusBadge({ status }: { status: string }) {
  const statusLower = (status || '').toLowerCase();
  
  const statusConfig: Record<string, { style: string; label: string; icon: React.ReactNode }> = {
    completed: {
      style: 'bg-green-50 text-green-700 ring-1 ring-green-200',
      label: 'Hoàn thành',
      icon: <FaCheckCircle className="w-3 h-3" />
    },
    paid: {
      style: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      label: 'Đã thanh toán',
      icon: <FaCheckCircle className="w-3 h-3" />
    },
    in_progress: {
      style: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
      label: 'Đang xử lý',
      icon: <FaClock className="w-3 h-3" />
    },
    initiated: {
      style: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
      label: 'Đã khởi tạo',
      icon: <FaClock className="w-3 h-3" />
    },
    cancelled: {
      style: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      label: 'Đã hủy',
      icon: <FaTimesCircle className="w-3 h-3" />
    },
    failed: {
      style: 'bg-red-50 text-red-700 ring-1 ring-red-200',
      label: 'Thất bại',
      icon: <FaExclamationTriangle className="w-3 h-3" />
    },
  };
  
  const config = statusConfig[statusLower] || {
    style: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    label: status || 'Unknown',
    icon: <FaClock className="w-3 h-3" />
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// Format date helper
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
}

// Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

const HistoryPage = () => {
  const { user } = useAuth();
  const [swapTransactions, setSwapTransactions] = useState<SwapTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSwapHistory = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('[History] Loading swap history for current user');
        // Use getMySwapTransactions which calls /me/swap-transactions endpoint
        const swaps = await swapTransactionRepository.getMySwapTransactions();
        
        // Sort by swap date (newest first)
        const sortedSwaps = (swaps || []).sort((a, b) => {
          const dateA = a.swapDate || a.createdAt || '';
          const dateB = b.swapDate || b.createdAt || '';
          
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          try {
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          } catch (e) {
            return 0;
          }
        });
        
        console.log('[History] Loaded swap transactions:', sortedSwaps);
        setSwapTransactions(sortedSwaps);
      } catch (err: any) {
        console.error('[History] Failed to load swap history:', err);
        setError(err?.message || 'Không thể tải lịch sử giao dịch');
      } finally {
        setLoading(false);
      }
    };

    loadSwapHistory();
  }, [user?.userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải lịch sử giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FaHistory className="text-3xl text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Lịch sử giao dịch
            </h1>
          </div>
          <p className="text-gray-600">
            Xem lại tất cả các giao dịch hoán đổi pin của bạn
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Swap Transactions List */}
        {swapTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có giao dịch nào
            </h3>
            <p className="text-gray-500">
              Bạn chưa thực hiện giao dịch hoán đổi pin nào
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {swapTransactions.map((swap) => {
              const swapDate = swap.swapDate || swap.createdAt || '';
              const stationName = swap.stationName || 'Trạm không xác định';
              const vehiclePlate = swap.vehiclePlate || '—';
              const amount = swap.amount || swap.cost || 0;
              const status = swap.status || swap.swapStatus || 'unknown';
              const oldBattery = swap.oldBatteryCode || swap.oldBatteryID || '—';
              const newBattery = swap.newBatteryCode || swap.newBatteryID || '—';
              const transactionId = swap.swapTransactionID || '—';

              return (
                <div
                  key={swap.swapTransactionID}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-4 md:p-6">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FaMapMarkerAlt className="text-indigo-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {stationName}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500">
                          Mã giao dịch: {transactionId}
                        </p>
                      </div>
                      <SwapStatusBadge status={status} />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-start gap-3">
                        <FaCalendarAlt className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Thời gian</p>
                          <p className="text-sm font-medium text-gray-900">
                            {swapDate ? formatDate(swapDate) : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Vehicle Plate */}
                      <div className="flex items-start gap-3">
                        <FaBatteryHalf className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Biển số xe</p>
                          <p className="text-sm font-medium text-gray-900">
                            {vehiclePlate}
                          </p>
                        </div>
                      </div>

                      {/* Old Battery */}
                      <div className="flex items-start gap-3">
                        <FaBatteryHalf className="text-red-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Pin cũ</p>
                          <p className="text-sm font-medium text-gray-900">
                            {oldBattery}
                          </p>
                        </div>
                      </div>

                      {/* New Battery */}
                      <div className="flex items-start gap-3">
                        <FaBatteryFull className="text-green-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Pin mới</p>
                          <p className="text-sm font-medium text-gray-900">
                            {newBattery}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Tổng tiền
                          </span>
                        </div>
                        <span className="text-lg font-bold text-indigo-600">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default withCustomerAuth(HistoryPage);
