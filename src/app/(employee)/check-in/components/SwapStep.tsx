/**
 * SwapStep Component
 * Step 4: Swap battery (select old battery OUT and new battery IN)
 */

import { useState, useMemo } from 'react';
import {
  Battery,
  BatteryCharging,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { SwapStepProps } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/presentation/components/ui/Notification';
import swapTransactionService from '@/application/services/swapTransactionService';
import type { Battery as DomainBattery } from '@/domain/entities/Battery';

type SwapSubStep = 'scan-old' | 'scan-new' | 'confirm' | 'processing';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function SwapStep({
  bookingData,
  driverName,
  oldBatteryId,
  newBatteryId,
  setOldBatteryId,
  setNewBatteryId,
  batteries,
  stationId,
  fromPayment = false,
  onComplete,
  onBack,
}: SwapStepProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [subStep, setSubStep] = useState<SwapSubStep>('scan-old');
  const [loading, setLoading] = useState(false);

  // Extract battery IDs from batteries
  const stationBatteryIds = useMemo(() => {
    if (!batteries || batteries.length === 0) return [];
    return batteries
      .filter((b: DomainBattery) => (b as any).batteryID || (b as any).batteryId || (b as any).id)
      .map((b: DomainBattery) => (b as any).batteryID || (b as any).batteryId || (b as any).id);
  }, [batteries]);

  const handleConfirmSwap = async () => {
    // Validation
    if (!oldBatteryId || !newBatteryId) {
      showToast({ type: 'error', message: 'Please enter both old and new battery IDs' });
      return;
    }

    if (oldBatteryId === newBatteryId) {
      showToast({ type: 'error', message: 'Old and new batteries must be different!' });
      return;
    }

    // Validate battery ID format
    const batteryIdRegex = /^[A-Z0-9_-]+$/i;
    if (!batteryIdRegex.test(oldBatteryId)) {
      showToast({ type: 'error', message: 'Invalid old battery ID!' });
      return;
    }
    if (!batteryIdRegex.test(newBatteryId)) {
      showToast({ type: 'error', message: 'Invalid new battery ID!' });
      return;
    }

    try {
      setLoading(true);
      setSubStep('processing');

      console.debug('[SwapStep] Starting swap transaction...');
      console.debug('[SwapStep] Old Battery:', oldBatteryId);
      console.debug('[SwapStep] New Battery:', newBatteryId);

      const bookingId = bookingData?.bookingID || (bookingData as any)?.id;
      const customerId = (bookingData as any)?.customerId || (bookingData as any)?.customerID || (bookingData as any)?.userId;

      console.debug('[SwapStep] Booking ID:', bookingId);
      console.debug('[SwapStep] Customer ID:', customerId);

      // Ensure stationId exists
      if (!stationId) {
        showToast({
          type: 'error',
          message: 'Station ID does not exist. Please check staff configuration.',
        });
        setLoading(false);
        setSubStep('confirm');
        return;
      }

      // Generate swap transaction ID
      const swapTxId = generateUUID();
      console.debug('[SwapStep] Generated Swap TX ID:', swapTxId);

      // Prepare payload
      const payload = {
        oldBatteryID: oldBatteryId.trim(),
        newBatteryID: newBatteryId.trim(),
        stationID: stationId,
        bookingID: bookingId || undefined,
        customerID: customerId || undefined,
      };

      console.debug('[SwapStep] 📤 Payload:', payload);
      console.debug('[SwapStep] 📤 API: POST /swap-transactions/' + swapTxId + '/completed');

      // Call API
      const result = await swapTransactionService.completeSwapTransaction(swapTxId, payload);

      console.debug('[SwapStep] ✅ Response:', result);
      console.debug('[SwapStep] ✅ Swap completed successfully!');

      showToast({
        type: 'success',
        message: '✅ Battery swap successful!',
        duration: 3000,
      });

      // Wait before navigating
      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (error: any) {
      console.error('[SwapStep] ❌ Error:', error);

      let errorMessage = 'Failed to complete swap';
      if (error?.message) {
        errorMessage = error.message;
      }

      showToast({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 5000,
      });

      // Go back to confirm step
      setSubStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Swap Battery</h2>
        <p className="text-gray-600">
          Customer: <span className="font-semibold">{driverName}</span>
        </p>
      </div>

      {/* Sub-steps indicator */}
      <div className="mb-8 flex items-center justify-center gap-3">
        {[
          { key: 'scan-old', label: 'Old Battery', icon: Battery },
          { key: 'scan-new', label: 'New Battery', icon: BatteryCharging },
          { key: 'confirm', label: 'Confirm', icon: CheckCircle2 },
        ].map((s, idx) => {
          const isActive = subStep === s.key;
          const isPassed =
            (subStep === 'scan-new' || subStep === 'confirm' || subStep === 'processing') &&
              s.key === 'scan-old' ||
            (subStep === 'confirm' || subStep === 'processing') && s.key === 'scan-new';

          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive || isPassed ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    isPassed
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white scale-110'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              {idx < 2 && <ArrowRight className="w-5 h-5 text-gray-300 -mt-4" />}
            </div>
          );
        })}
      </div>

      {/* Scan Old Battery */}
      {subStep === 'scan-old' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Battery className="inline w-5 h-5 mr-2 text-red-500" />
              Select old battery to remove (OUT)
            </label>

            {stationBatteryIds.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading battery list...</p>
              </div>
            ) : (
              <select
                value={oldBatteryId}
                onChange={(e) => setOldBatteryId(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 text-gray-900 text-base font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white hover:border-gray-400"
                autoFocus
              >
                <option value="" className="text-gray-500">
                  -- Select old battery ID --
                </option>
                {stationBatteryIds.map((id: string) => (
                  <option key={id} value={id} className="text-gray-900 font-medium py-2">
                    🔋 {id}
                  </option>
                ))}
              </select>
            )}

            {stationBatteryIds.length > 0 && (
              <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <Battery className="w-4 h-4" />
                <span className="font-bold text-blue-600">{stationBatteryIds.length}</span> batteries at station
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {!fromPayment && (
              <button
                onClick={onBack}
                className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => setSubStep('scan-new')}
              disabled={!oldBatteryId || stationBatteryIds.length === 0}
              className={`${
                fromPayment ? 'w-full' : 'flex-1'
              } h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none`}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Scan New Battery */}
      {subStep === 'scan-new' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <BatteryCharging className="inline w-5 h-5 mr-2 text-green-500" />
              Select new battery to install (IN)
            </label>

            {stationBatteryIds.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading battery list...</p>
              </div>
            ) : (
              <select
                value={newBatteryId}
                onChange={(e) => setNewBatteryId(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 text-gray-900 text-base font-medium focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white hover:border-gray-400"
                autoFocus
              >
                <option value="" className="text-gray-500">
                  -- Select new battery ID --
                </option>
                {stationBatteryIds
                  .filter((id: string) => id !== oldBatteryId)
                  .map((id: string) => (
                    <option key={id} value={id} className="text-gray-900 font-medium py-2">
                      🔋 {id}
                    </option>
                  ))}
              </select>
            )}

            {oldBatteryId && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Selected old battery:</span> {oldBatteryId}
                </p>
              </div>
            )}

            {stationBatteryIds.length > 0 && (
              <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4" />
                <span className="font-bold text-green-600">
                  {stationBatteryIds.filter((id: string) => id !== oldBatteryId).length}
                </span>{' '}
                batteries available
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSubStep('scan-old')}
              className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => setSubStep('confirm')}
              disabled={!newBatteryId || stationBatteryIds.length === 0}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Confirm */}
      {subStep === 'confirm' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Confirm swap information:</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">{driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Old Battery (OUT):</span>
                <code className="px-2 py-1 bg-red-100 text-red-800 rounded font-mono text-sm">
                  {oldBatteryId}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Battery (IN):</span>
                <code className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono text-sm">
                  {newBatteryId}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                  {bookingData?.bookingID || (bookingData as any)?.id || 'N/A'}
                </code>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSubStep('scan-new')}
              className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              ← Edit
            </button>
            <button
              onClick={handleConfirmSwap}
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm Swap
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {subStep === 'processing' && (
        <div className="py-12 text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">Processing swap transaction...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait a moment</p>
        </div>
      )}
    </div>
  );
}


