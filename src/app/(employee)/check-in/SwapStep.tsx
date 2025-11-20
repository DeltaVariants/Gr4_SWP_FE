/**
 * SwapStep Component
 * Step 3: Complete battery swap
 * 
 * IMPORTANT: Flow theo backend:
 * - SwapTransaction được tạo khi confirm booking với status="completed"
 * - Backend tự động chọn NewBatteryID từ available batteries
 * - Backend tự động lấy OldBatteryID từ vehicle
 * - SwapTransaction có status="initiated" sau khi confirm
 * - Backend API: POST /api/swap-transactions/{id}/completed
 * - Backend có thể xử lý status="initiated" trực tiếp, không cần update thành "inprogress"
 */

import { useState, useEffect } from 'react';
import {
  Battery,
  BatteryCharging,
  CheckCircle2,
  Loader2,
  XCircle,
} from 'lucide-react';
import { SwapStepProps } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import { swapTransactionRepository } from '@/infrastructure/repositories/Hoang/SwapTransactionRepository';
import { batteryRepository } from '@/infrastructure/repositories/Hoang/BatteryRepository';
import { OldBatteryConditionLog } from './OldBatteryConditionLog';
import { Battery as BatteryType } from '@/domain/dto/Hoang/Battery';

export function SwapStep({
  bookingData,
  driverName,
  swapTransactionId,
  onComplete,
  onBack,
  onCancel,
}: SwapStepProps & { onCancel?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingTransaction, setLoadingTransaction] = useState(true);
  const [swapTransaction, setSwapTransaction] = useState<any>(null);
  const [oldBattery, setOldBattery] = useState<BatteryType | null>(null);
  const [newBattery, setNewBattery] = useState<BatteryType | null>(null);
  const [loadingBatteries, setLoadingBatteries] = useState(false);

  // Load SwapTransaction details and batteries
  useEffect(() => {
    const loadData = async () => {
      if (!swapTransactionId) {
        setLoadingTransaction(false);
        showToast({
          type: 'error',
          message: 'SwapTransaction ID not found. Please verify booking first.',
        });
        return;
      }

      try {
        setLoadingBatteries(true);
        console.debug('[SwapStep] Loading SwapTransaction:', swapTransactionId);
        const transaction = await swapTransactionRepository.getById(swapTransactionId);
        console.debug('[SwapStep] ✅ Loaded SwapTransaction:', transaction);
        setSwapTransaction(transaction);

        // Load old battery if exists
        // Backend trả về OldBatteryID (PascalCase) - có thể null nếu customer mới
        const oldBatteryId = transaction?.OldBatteryID || transaction?.oldBatteryID || transaction?.oldBatteryId;
        console.log('[SwapStep] 🔍 OldBatteryID from transaction:', {
          OldBatteryID: transaction?.OldBatteryID,
          oldBatteryID: transaction?.oldBatteryID,
          oldBatteryId: transaction?.oldBatteryId,
          resolved: oldBatteryId,
          transactionKeys: transaction ? Object.keys(transaction) : []
        });
        
        if (oldBatteryId && oldBatteryId.trim().length > 0) {
          try {
            console.debug('[SwapStep] 📥 Loading old battery details:', oldBatteryId);
            const oldBatteryData = await batteryRepository.getById(oldBatteryId);
            console.debug('[SwapStep] ✅ Loaded old battery data:', {
              batteryId: oldBatteryData.batteryId,
              batteryType: oldBatteryData.batteryType,
              soH: oldBatteryData.soH,
              currentPercentage: oldBatteryData.currentPercentage,
              status: oldBatteryData.status,
              currentLocation: oldBatteryData.currentLocation,
              allFields: oldBatteryData
            });
            setOldBattery(oldBatteryData);
          } catch (error: any) {
            console.error('[SwapStep] ❌ Failed to load old battery:', {
              batteryId: oldBatteryId,
              error: error?.message,
              response: error?.response?.data,
              status: error?.response?.status
            });
            // Continue without old battery (customer may be new or battery not found)
            // Set oldBattery to null để component hiển thị đúng
            setOldBattery(null);
          }
        } else {
          console.debug('[SwapStep] ℹ️ No old battery ID (customer may be new)');
          setOldBattery(null);
        }

        // Load new battery (already selected by backend)
        // Backend trả về NewBatteryID (PascalCase) - required field
        const newBatteryId = transaction?.NewBatteryID || transaction?.newBatteryID || transaction?.newBatteryId;
        if (newBatteryId && newBatteryId.trim().length > 0) {
          try {
            console.debug('[SwapStep] Loading new battery:', newBatteryId);
            const newBatteryData = await batteryRepository.getById(newBatteryId);
            console.debug('[SwapStep] ✅ Loaded new battery:', newBatteryData);
            setNewBattery(newBatteryData);
          } catch (error: any) {
            console.error('[SwapStep] ❌ Failed to load new battery:', error);
            showToast({
              type: 'error',
              message: `Failed to load new battery: ${error?.message || 'Unknown error'}`,
            });
          }
        } else {
          console.error('[SwapStep] ❌ New battery ID is missing in SwapTransaction');
          showToast({
            type: 'error',
            message: 'New battery ID not found in swap transaction. Please contact support.',
          });
        }
      } catch (error: any) {
        console.error('[SwapStep] ❌ Failed to load SwapTransaction:', error);
        showToast({
          type: 'error',
          message: `Failed to load swap transaction: ${error?.message || 'Unknown error'}`,
        });
      } finally {
        setLoadingTransaction(false);
        setLoadingBatteries(false);
      }
    };

    loadData();
  }, [swapTransactionId, showToast]);

  const handleConfirmSwap = async () => {
    if (!swapTransactionId) {
      showToast({
        type: 'error',
        message: 'SwapTransaction ID not found. Please verify booking first.',
      });
      return;
    }

    try {
      setLoading(true);

      console.debug('[SwapStep] 📤 Completing SwapTransaction:', swapTransactionId);
      console.debug('[SwapStep] ℹ️ Current status:', swapStatus);
      
      // Get SoH from old battery (if available)
      const soH = oldBattery?.soH || oldBattery?.stateOfHealth;
      console.debug('[SwapStep] ℹ️ Old battery SoH:', soH);
      
      // Backend API: POST /api/swap-transactions/{id}/completed?Soh={soh}
      // Backend có thể xử lý status="initiated" trực tiếp
      console.debug('[SwapStep] ℹ️ Backend API: POST /api/swap-transactions/{id}/completed?Soh=', soH);
      const result = await swapTransactionRepository.complete(swapTransactionId, soH);

      console.debug('[SwapStep] ✅ SwapTransaction completed successfully!');
      console.debug('[SwapStep] ✅ Response:', result);

      const completedTransactionId =
        result?.swapTransactionID ||
        result?.transactionID ||
        result?.id ||
        (result as any)?.swapTransactionId ||
        swapTransactionId;

      showToast({
        type: 'success',
        message: '✅ Battery swap completed successfully!',
        duration: 3000,
      });

      // Pass transactionID to onComplete callback
      setTimeout(() => {
        onComplete(completedTransactionId);
      }, 500);
    } catch (error: any) {
      console.error('[SwapStep] ❌ Error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to complete swap transaction';

      showToast({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSwap = async () => {
    if (!swapTransactionId) {
      showToast({
        type: 'error',
        message: 'SwapTransaction ID not found.',
      });
      return;
    }

    // Confirm cancellation
    if (!window.confirm('Bạn có chắc chắn muốn hủy swap transaction này?')) {
      return;
    }

    try {
      setLoading(true);

      console.debug('[SwapStep] 📤 Cancelling SwapTransaction:', swapTransactionId);
      console.debug('[SwapStep] ℹ️ Backend API: POST /api/swap-transactions/{id}/cancelled (no payload needed)');
      
      const result = await swapTransactionRepository.cancel(swapTransactionId);

      console.debug('[SwapStep] ✅ SwapTransaction cancelled successfully!');
      console.debug('[SwapStep] ✅ Response:', result);

      showToast({
        type: 'success',
        message: '✅ Swap transaction đã được hủy thành công!',
        duration: 3000,
      });

      // Call onCancel callback if provided
      if (onCancel) {
        setTimeout(() => {
          onCancel();
        }, 500);
      }
    } catch (error: any) {
      console.error('[SwapStep] ❌ Cancel error:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to cancel swap transaction';

      showToast({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Extract battery IDs from swap transaction
  const oldBatteryId = swapTransaction?.oldBatteryID || swapTransaction?.oldBatteryId || swapTransaction?.OldBatteryID || 'N/A';
  const newBatteryId = swapTransaction?.newBatteryID || swapTransaction?.newBatteryId || swapTransaction?.NewBatteryID || 'N/A';
  const swapStatus = swapTransaction?.swapStatus || swapTransaction?.SwapStatus || swapTransaction?.status || 'N/A';
  const cost = swapTransaction?.cost || swapTransaction?.Cost || 0;

  if (loadingTransaction || loadingBatteries) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="py-12 text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">Loading swap transaction...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!swapTransaction) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Swap Transaction Not Found</p>
          <p className="text-sm text-gray-600 mb-4">
            Please confirm booking first to create swap transaction.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              ← Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Battery Swap</h2>
        <p className="text-gray-600">
          Customer: <span className="font-semibold">{driverName}</span>
        </p>
      </div>

      {/* Swap Information */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Old Battery Section */}
        {oldBatteryId && oldBatteryId !== 'N/A' && (
          <OldBatteryConditionLog
            oldBattery={oldBattery}
            oldBatteryId={oldBatteryId}
          />
        )}

        {/* New Battery Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BatteryCharging className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-gray-900">New Battery (Selected by System)</h3>
          </div>

          {newBattery ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Battery ID</label>
                <div className="text-sm font-medium text-gray-900">{newBattery.batteryId || newBatteryId}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Battery Type</label>
                <div className="text-sm font-medium text-gray-900">{newBattery.batteryType || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">State of Health (SoH)</label>
                <div className="flex items-center gap-2">
                  {typeof newBattery.soH === 'number' ? (
                    <>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            newBattery.soH >= 80 ? 'bg-green-500' : 
                            newBattery.soH >= 60 ? 'bg-yellow-500' : 
                            newBattery.soH >= 40 ? 'bg-orange-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${newBattery.soH}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                        {newBattery.soH}%
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">{newBattery.soH || 'N/A'}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Current Percentage</label>
                <div className="flex items-center gap-2">
                  {typeof newBattery.currentPercentage === 'number' ? (
                    <>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            newBattery.currentPercentage >= 80 ? 'bg-green-500' : 
                            newBattery.currentPercentage >= 50 ? 'bg-yellow-500' : 
                            newBattery.currentPercentage >= 20 ? 'bg-orange-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${newBattery.currentPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                        {newBattery.currentPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">{newBattery.currentPercentage || 'N/A'}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <div className="text-sm font-medium text-gray-900">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    newBattery.status === 'Available' ? 'bg-green-100 text-green-800' :
                    newBattery.status === 'In-Use' ? 'bg-blue-100 text-blue-800' :
                    newBattery.status === 'Charging' ? 'bg-yellow-100 text-yellow-800' :
                    newBattery.status === 'Maintenance' ? 'bg-purple-100 text-purple-800' :
                    newBattery.status === 'Damaged' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {newBattery.status || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Current Location</label>
                <div className="text-sm font-medium text-gray-900">
                  {newBattery.currentLocation || newBattery?.CurrentLocation || 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Battery ID: <code className="px-2 py-1 bg-gray-100 rounded font-mono">{newBatteryId}</code>
              <p className="text-xs text-gray-500 mt-2">Loading battery details...</p>
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Transaction Details:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction ID:</span>
              <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                {swapTransactionId}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                (swapStatus?.toLowerCase() === 'initiated' || swapStatus?.toLowerCase() === 'inprogress')
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {swapStatus}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Booking ID:</span>
              <code className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-mono text-sm">
                {bookingData?.bookingID || (bookingData as any)?.id || 'N/A'}
              </code>
            </div>
            {cost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost:</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cost)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info message */}
        {swapStatus?.toLowerCase() !== 'initiated' && swapStatus?.toLowerCase() !== 'inprogress' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Swap transaction status is <strong>{swapStatus}</strong>. 
              Please ensure transaction is ready before completing the swap.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              disabled={loading}
              className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Back
            </button>
          )}
          {onCancel && (swapStatus?.toLowerCase() === 'initiated' || swapStatus?.toLowerCase() === 'inprogress') && (
            <button
              onClick={handleCancelSwap}
              disabled={loading}
              className="flex-1 h-12 rounded-xl border-2 border-rose-300 text-rose-700 font-semibold hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Cancel Swap
                </>
              )}
            </button>
          )}
          <button
            onClick={handleConfirmSwap}
            disabled={loading || (swapStatus?.toLowerCase() !== 'initiated' && swapStatus?.toLowerCase() !== 'inprogress')}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Complete Swap
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


