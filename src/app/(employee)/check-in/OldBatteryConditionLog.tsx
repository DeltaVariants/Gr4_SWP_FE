/**
 * OldBatteryConditionLog Component
 * Component để hiển thị và log tình trạng pin cũ
 */

import { useState } from 'react';
import { Battery, AlertTriangle, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/presentation/components/ui/Notification';
import { batteryConditionRepository } from '@/infrastructure/repositories/Hoang/BatteryConditionRepository';
import { CreateBatteryConditionData } from '@/domain/dto/Hoang/BatteryCondition';
import { Battery as BatteryType } from '@/domain/dto/Hoang/Battery';

interface OldBatteryConditionLogProps {
  oldBattery: BatteryType | null;
  oldBatteryId: string | null;
  onLogCreated?: () => void;
}

export function OldBatteryConditionLog({
  oldBattery,
  oldBatteryId,
  onLogCreated,
}: OldBatteryConditionLogProps) {
  const { showToast } = useToast();
  const [condition, setCondition] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);

  // Condition options
  const conditionOptions = [
    { value: 'Good', label: 'Good - No issues' },
    { value: 'Damaged', label: 'Damaged - Physical damage' },
    { value: 'Dented', label: 'Dented - Dents or deformations' },
    { value: 'Corroded', label: 'Corroded - Corrosion present' },
    { value: 'Other', label: 'Other - Other issues' },
  ];

  const handleLogCondition = async () => {
    if (!oldBatteryId) {
      showToast({
        type: 'error',
        message: 'Battery ID not found',
      });
      return;
    }

    if (!condition) {
      showToast({
        type: 'error',
        message: 'Please select a condition',
      });
      return;
    }

    try {
      setLoading(true);
      console.log('[OldBatteryConditionLog] Creating condition log:', {
        batteryID: oldBatteryId,
        condition,
        description,
      });

      const logData: CreateBatteryConditionData = {
        batteryID: oldBatteryId,
        Condition: condition,
        Description: description || `Battery condition: ${condition}`,
      };

      const result = await batteryConditionRepository.create(logData);
      console.log('[OldBatteryConditionLog] ✅ Condition log created:', result);

      setLogged(true);
      showToast({
        type: 'success',
        message: 'Battery condition logged successfully',
      });

      if (onLogCreated) {
        onLogCreated();
      }
    } catch (error: any) {
      console.error('[OldBatteryConditionLog] ❌ Failed to log condition:', error);
      const errorMessage = error?.message || 'Failed to log battery condition';
      showToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no old battery
  if (!oldBatteryId && !oldBattery) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <Battery className="w-4 h-4 inline mr-2" />
          This is a new customer - no old battery to inspect.
        </p>
      </div>
    );
  }

  const batteryId = oldBatteryId || oldBattery?.batteryId || 'N/A';
  const batteryType = oldBattery?.batteryType || 'N/A';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Battery className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Old Battery Information</h3>
      </div>

      {/* Battery Details - Chỉ hiển thị Battery ID và Battery Type */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Battery ID</label>
          <div className="text-sm font-medium text-gray-900">{batteryId}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Battery Type</label>
          <div className="text-sm font-medium text-gray-900">{batteryType}</div>
        </div>
      </div>

      {/* Condition Log Form */}
      {!logged ? (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-semibold text-gray-900">Log Battery Condition</h4>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border-2 border-gray-200 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="" className="text-gray-900">Select condition...</option>
              {conditionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe any issues (dents, corrosion, etc.)..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm text-gray-900 placeholder:text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
            />
          </div>

          <button
            onClick={handleLogCondition}
            disabled={loading || !condition}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Log Condition
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Condition logged successfully</span>
          </div>
        </div>
      )}
    </div>
  );
}

