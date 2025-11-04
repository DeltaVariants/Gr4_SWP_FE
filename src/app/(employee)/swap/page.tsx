"use client";

import { withStaffAuth } from '@/hoc/withAuth';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import swapTransactionService from '@/application/services/swapTransactionService';
import batteryService from '@/application/services/batteryService';
import { useToast } from '@/presentation/components/ui/Notification';
import { Battery, BatteryCharging, Scan, ArrowRight, CheckCircle2, AlertTriangle, Loader2, XCircle, Info } from 'lucide-react';

// Simple UUID v4 generator (no external library needed)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Local storage key for transient events/logs so UI can show history without backend list endpoint
const LOCAL_TRANSFERS_KEY = 'localTransfers_v1';

function pushLocalTransfer(entry: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(LOCAL_TRANSFERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(LOCAL_TRANSFERS_KEY, JSON.stringify(list.slice(0, 250)));
  } catch (e) {
    // ignore
  }
}

function updateLocalTransferStatus(transferId: string, patch: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(LOCAL_TRANSFERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const updated = list.map((t: Record<string, unknown>) => (String(t['transferId']) === transferId ? { ...t, ...patch } : t));
    localStorage.setItem(LOCAL_TRANSFERS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export default withStaffAuth(function SwapPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const reservationId = params.get('reservationId');
  const bookingId = params.get('bookingId');
  
  const [oldId, setOldId] = useState('');
  const [newId, setNewId] = useState('');
  const [step, setStep] = useState<'scan-old' | 'scan-new' | 'confirm' | 'processing' | 'completed'>('scan-old');
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('Issue');
  const [lastCreatedTransferId, setLastCreatedTransferId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualStationId, setManualStationId] = useState('');
  const [showStationIdInput, setShowStationIdInput] = useState(false);
  const [stationBatteryIds, setStationBatteryIds] = useState<string[]>([]);
  const [loadingStationBatteries, setLoadingStationBatteries] = useState(false);

  const handleScanOld = () => {
    if (!oldId.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập mã pin cũ' });
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep('scan-new');
    }, 800);
  };

  const handleScanNew = () => {
    if (!newId.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập mã pin mới' });
      return;
    }
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setStep('confirm');
    }, 800);
  };

  // ENFORCE: Block direct access if no booking (MANDATORY BOOKING FLOW)
  useEffect(() => {
    if (!bookingId) {
      console.warn('[Swap] ⚠️ BLOCKED - Direct access denied. No booking found.');
      showToast({ 
        type: 'error', 
        message: 'Truy cập bị từ chối! Vui lòng sử dụng Check-in & Swap thay thế.',
        duration: 4000
      });
      router.replace('/check-in');
    } else {
      console.log('[Swap] ✅ Access granted - Booking:', bookingId);
    }
  }, [bookingId, router, showToast]);

  // Block rendering if no bookingId
  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-red-50 rounded-2xl p-12 border-2 border-red-200">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Trang này chỉ được truy cập thông qua flow <strong>Check-in & Swap</strong>.
            <br />
            Vui lòng sử dụng menu Check-in & Swap để thực hiện giao dịch.
          </p>
          <button
            onClick={() => router.push('/check-in')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
          >
            ← Quay về Check-in & Swap
          </button>
        </div>
      </div>
    );
  }

  // Load station battery IDs for dropdowns
  useEffect(() => {
    let mounted = true;
    const loadStationBatteries = async () => {
      try {
        setLoadingStationBatteries(true);
        const u = user as Record<string, unknown> | null;
        let stationId: string | undefined;
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

        // If no stationId from user, try /api/auth/me
        if (!stationId && typeof window !== 'undefined') {
          try {
            const token = localStorage.getItem('accessToken');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const meRes = await fetch('/api/auth/me', { cache: 'no-store', headers });
            const mePayload = await meRes.json().catch(() => ({}));
            if (meRes.ok && mePayload?.success && mePayload.data) {
              const d = mePayload.data as Record<string, unknown>;
              stationId = (d['stationId'] || d['StationID'] || d['stationID'] || d['StationId'] || d['stationName'] || d['StationName']) as string | undefined;
            }
          } catch (e) {
            // ignore
          }
        }

        if (stationId) {
          try {
            const ids = await batteryService.getBatteryIdsByStation(stationId);
            if (mounted) setStationBatteryIds(ids || []);
          } catch (e) {
            console.error('[Swap] Failed to load station batteries:', e);
          }
        }
      } finally {
        if (mounted) setLoadingStationBatteries(false);
      }
    };
    loadStationBatteries();
    return () => { mounted = false; };
  }, [user]);

  const confirmSwap = async () => {
    try {
      setStep('processing');
      
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let stationId = undefined as string | undefined;
      let stationNameValue = undefined as string | undefined;
      const u = user as Record<string, unknown> | null;
      
      console.log('[Swap] User object:', u);
      
      // Step 1: Lấy stationId và stationName từ user
      if (u) {
        // Ưu tiên lấy stationId nếu có và là GUID
        const possibleId = (
          u['stationId'] || 
          u['StationID'] || 
          u['stationID'] || 
          u['StationId'] ||
          u['station_id'] ||
          u['station'] ||
          u['Station']
        ) as string | undefined;
        
        // Lấy stationName riêng
        stationNameValue = (
          u['stationName'] || 
          u['StationName']
        ) as string | undefined;
        
        // Nếu possibleId là GUID thì dùng luôn
        if (possibleId && guidPattern.test(possibleId)) {
          stationId = possibleId;
          console.log('[Swap] Found valid GUID from user.stationId:', stationId);
        } else if (possibleId) {
          // Nếu possibleId không phải GUID, có thể là tên
          stationNameValue = possibleId;
          console.log('[Swap] stationId is not GUID, treating as name:', possibleId);
        }
      }
      
      // Step 2: Nếu chưa có GUID nhưng có tên, fetch từ API
      if (!stationId && stationNameValue) {
        console.log('[Swap] Attempting to fetch stationId from name:', stationNameValue);
        
        try {
          const { getStationIdByName } = await import('@/application/services/stationService');
          const fetchedStationId = await getStationIdByName(stationNameValue);
          
          if (fetchedStationId && guidPattern.test(fetchedStationId)) {
            stationId = fetchedStationId;
            console.log('[Swap] Successfully fetched stationId:', stationId);
            showToast({ 
              type: 'success', 
              message: `Đã tìm thấy trạm: ${stationNameValue}`,
              duration: 2000
            });
          } else {
            console.warn('[Swap] API returned invalid stationId:', fetchedStationId);
          }
        } catch (error) {
          console.error('[Swap] Error fetching stationId from API:', error);
        }
      }
      
      // Step 3: Nếu vẫn chưa có, thử fetch từ /api/auth/me
      if (!stationId && !stationNameValue && typeof window !== 'undefined') {
        console.log('[Swap] No station info from user, fetching from /api/auth/me');
        
        try {
          const token = localStorage.getItem('accessToken');
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          
          const meRes = await fetch('/api/auth/me', { 
            cache: 'no-store',
            headers 
          });
          const mePayload = await meRes.json().catch(() => ({}));
          
          if (meRes.ok && mePayload?.success && mePayload.data) {
            const d = mePayload.data as Record<string, unknown>;
            
            // Lấy stationName từ /api/auth/me
            stationNameValue = (
              d['stationName'] || 
              d['StationName']
            ) as string | undefined;
            
            console.log('[Swap] Got stationName from /api/auth/me:', stationNameValue);
            
            // Thử fetch ID từ tên
            if (stationNameValue) {
              try {
                const { getStationIdByName } = await import('@/application/services/stationService');
                const fetchedStationId = await getStationIdByName(stationNameValue);
                
                if (fetchedStationId && guidPattern.test(fetchedStationId)) {
                  stationId = fetchedStationId;
                  console.log('[Swap] Fetched stationId from /api/auth/me name:', stationId);
                }
              } catch (error) {
                console.error('[Swap] Error fetching stationId:', error);
              }
            }
          }
        } catch (e) {
          console.error('[Swap] Error fetching /api/auth/me:', e);
        }
      }
      
      // Step 4: Check manual input
      if (!stationId && manualStationId.trim()) {
        const manualValue = manualStationId.trim();
        
        if (guidPattern.test(manualValue)) {
          stationId = manualValue;
          console.log('[Swap] Using manual GUID:', stationId);
        } else {
          // Manual input là tên, thử fetch
          console.log('[Swap] Manual input is name, fetching ID:', manualValue);
          try {
            const { getStationIdByName } = await import('@/application/services/stationService');
            const fetchedStationId = await getStationIdByName(manualValue);
            
            if (fetchedStationId && guidPattern.test(fetchedStationId)) {
              stationId = fetchedStationId;
              console.log('[Swap] Fetched from manual name:', stationId);
            }
          } catch (error) {
            console.error('[Swap] Error with manual input:', error);
          }
        }
      }

      // Step 5: Final validation
      if (!stationId) {
        console.error('[Swap] No valid stationId found after all attempts');
        console.error('[Swap] - User object:', u);
        console.error('[Swap] - Station name:', stationNameValue);
        console.error('[Swap] - Manual input:', manualStationId);
        
        showToast({ 
          type: 'error', 
          message: stationNameValue 
            ? `Không tìm thấy trạm "${stationNameValue}" trong hệ thống. Vui lòng nhập Station ID (GUID) thủ công.`
            : 'Không tìm thấy thông tin trạm. Vui lòng nhập Station ID (GUID) thủ công.'
        });
        setShowStationIdInput(true);
        setStep('confirm');
        return;
      }
      
      console.log('[Swap] Final stationId:', stationId);
      console.log('[Swap] Station name:', stationNameValue || 'N/A');

      // NEW: Use swapTransactionService with /api/swap-transactions/{id}/completed
      const swapTransactionId = generateUUID();
      
      const payload = {
        oldBatteryID: oldId,       // Note: capital ID to match backend schema
        newBatteryID: newId,       // Note: capital ID to match backend schema
        stationID: stationId,      // Note: capital ID to match backend schema
        bookingID: bookingId || undefined,
        customerID: undefined,     // Will be inferred from booking if needed
      };

      console.log('[Swap] 📤 Creating swap transaction:', {
        id: swapTransactionId,
        payload
      });
      console.log('[Swap] Token:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');
      
      // Backend auto-handles:
      // - Create battery-transfers (OUT old, IN new)
      // - Update battery-slots
      // - Update batteries status
      const result = await swapTransactionService.completeSwapTransaction(swapTransactionId, payload);
      
      console.log('[Swap] ✅ Swap completed:', result);
      
      // Persist to local log for UI reporting
      const log = {
        transferId: swapTransactionId,
        oldBatteryId: oldId,
        newBatteryId: newId,
        stationId,
        bookingId,
        status: 'Completed',
        createdAt: new Date().toISOString(),
        raw: result,
      };
      try { 
        pushLocalTransfer(log); 
        setLastCreatedTransferId(swapTransactionId); 
      } catch (e) {
        console.error('[Swap] Failed to save to local storage:', e);
      }

      showToast({ type: 'success', message: 'Đổi pin hoàn tất thành công!' });
      setStep('completed');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStep('scan-old');
        setOldId('');
        setNewId('');
      }, 3000);
    } catch (error: unknown) {
      let msg = 'Failed to create swap';
      if (error && typeof error === 'object' && 'message' in (error as Record<string, unknown>)) msg = String((error as Record<string, unknown>)['message']);
      else msg = String(error || msg);
      showToast({ type: 'error', message: msg });
      setStep('confirm');
    }
  };

  const openReport = () => {
    setReportType('Issue');
    setReportReason('');
    setReportOpen(true);
  };

  const submitReport = async () => {
    // Attach exception to local log and optionally rollback
    try {
      const transferId = lastCreatedTransferId;
      if (!transferId) {
        showToast({ type: 'error', message: 'Không tìm thấy transfer để ghi nhận. Hãy thực hiện swap trước.' });
        return;
      }
      const exception = { type: reportType, reason: reportReason, createdAt: new Date().toISOString() };
      updateLocalTransferStatus(transferId, { status: 'Exception', exception });
      
      // TODO: Implement rollback for swap transactions
      // Currently swap transactions are completed in one call
      // May need backend support for cancellation/rollback
      showToast({ type: 'success', message: 'Exception đã được ghi nhận' });
      
      setReportOpen(false);
    } catch (e) {
      showToast({ type: 'error', message: 'Failed to record exception' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Booking Status Banner */}
      {bookingId ? (
        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-5 border-2 border-emerald-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-900 mb-1">
                ✅ Swap với Booking
              </h3>
              <p className="text-sm text-emerald-700 mb-2">
                Giao dịch này được liên kết với booking của khách hàng. 
                Thông tin sẽ được lưu vào lịch sử.
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-emerald-800">Booking ID:</span>
                  <code className="px-2 py-0.5 bg-white rounded border border-emerald-300 text-emerald-900 font-mono">
                    {bookingId}
                  </code>
                </div>
                {reservationId && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-emerald-800">Reservation:</span>
                    <code className="px-2 py-0.5 bg-white rounded border border-emerald-300 text-emerald-900 font-mono">
                      {reservationId}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-1">
                ⚠️ Walk-in Swap (Không có Booking)
              </h3>
              <p className="text-sm text-amber-700 mb-2">
                Giao dịch này KHÔNG liên kết với booking. 
                Thông tin khách hàng sẽ không được lưu.
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 font-semibold">
                  💡 Tip: Nên check-in khách hàng trước khi swap
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-3">
        {[
          { key: 'scan-old', label: 'Pin cũ (OUT)', icon: Battery },
          { key: 'scan-new', label: 'Pin mới (IN)', icon: BatteryCharging },
          { key: 'confirm', label: 'Xác nhận', icon: CheckCircle2 },
        ].map((s, idx) => {
          const isActive = step === s.key;
          const isPassed = 
            (step === 'scan-new' || step === 'confirm' || step === 'processing' || step === 'completed') && s.key === 'scan-old' ||
            (step === 'confirm' || step === 'processing' || step === 'completed') && s.key === 'scan-new' ||
            (step === 'processing' || step === 'completed') && s.key === 'confirm';
          
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex flex-col items-center gap-2 transition-all ${isActive || isPassed ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  isPassed 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg' 
                    : isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-medium text-center max-w-[80px] ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <ArrowRight className={`w-6 h-6 -mt-6 ${isPassed ? 'text-emerald-500' : 'text-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Scan Old Battery */}
      {step === 'scan-old' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white mb-4 shadow-xl ${isScanning ? 'animate-pulse' : ''}`}>
              <Battery className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bước 1: Scan Pin Cũ (OUT)</h2>
            <p className="text-gray-600">Quét hoặc nhập mã pin khách hàng đang sử dụng</p>
          </div>

          <div className="max-w-lg mx-auto space-y-6">
              <div className="relative">
              <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={oldId}
                onChange={(e) => setOldId(e.target.value)}
                placeholder="Scan hoặc nhập mã pin cũ..."
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 text-black text-lg placeholder:text-gray-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleScanOld()}
                disabled={isScanning}
              />
              {/* Dropdown for selecting a valid battery from station (optional) */}
              {stationBatteryIds.length > 0 && (
                <select
                  className="mt-2 w-full h-11 px-3 rounded-lg border-2 border-gray-200"
                  value={oldId}
                  onChange={(e) => setOldId(e.target.value)}
                >
                  <option value="">-- Chọn pin cũ từ trạm --</option>
                  {stationBatteryIds.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={handleScanOld}
              disabled={!oldId.trim() || isScanning}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Tiếp theo
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Scan New Battery */}
      {step === 'scan-new' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 shadow-xl ${isScanning ? 'animate-pulse' : ''}`}>
              <BatteryCharging className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bước 2: Scan Pin Mới (IN)</h2>
            <p className="text-gray-600">Quét hoặc nhập mã pin đầy để cung cấp cho khách hàng</p>
          </div>

          {/* Show Old Battery Info */}
          <div className="max-w-lg mx-auto mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-rose-600" />
              <div>
                <div className="text-xs text-gray-600">Pin cũ (đã xác nhận)</div>
                <div className="font-semibold text-gray-900">{oldId}</div>
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-6">
              <div className="relative">
                <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="Scan hoặc nhập mã pin mới..."
                  className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 text-black text-lg placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleScanNew()}
                  disabled={isScanning}
                />
                {stationBatteryIds.length > 0 && (
                  <select
                    className="mt-2 w-full h-11 px-3 rounded-lg border-2 border-gray-200"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                  >
                    <option value="">-- Chọn pin mới từ trạm --</option>
                    {stationBatteryIds.map((id) => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                )}
              </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('scan-old')}
                className="flex-1 h-14 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
              >
                Quay lại
              </button>
              <button
                onClick={handleScanNew}
                disabled={!newId.trim() || isScanning}
                className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Tiếp theo
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Swap */}
      {step === 'confirm' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-4 shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bước 3: Xác nhận Hoàn tất</h2>
            <p className="text-gray-600">Kiểm tra thông tin và xác nhận hoàn tất quy trình đổi pin</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Battery Comparison */}
            <div className="grid grid-cols-2 gap-6">
              {/* Old Battery */}
              <div className="p-6 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border-2 border-rose-200">
                <div className="flex items-center gap-2 mb-3">
                  <Battery className="w-5 h-5 text-rose-600" />
                  <span className="text-sm font-semibold text-rose-900">PIN CŨ (OUT)</span>
                </div>
                <div className="text-2xl font-bold text-rose-900 break-all">{oldId}</div>
              </div>

              {/* New Battery */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <BatteryCharging className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-900">PIN MỚI (IN)</span>
                </div>
                <div className="text-2xl font-bold text-emerald-900 break-all">{newId}</div>
              </div>
            </div>

            {/* Manual Station ID Input (if needed) */}
            {showStationIdInput && (
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">Không tìm thấy Station ID</span>
                </div>
                <p className="text-sm text-amber-700 mb-3">Vui lòng nhập Station ID của bạn để tiếp tục:</p>
                <input
                  type="text"
                  value={manualStationId}
                  onChange={(e) => setManualStationId(e.target.value)}
                  placeholder="Nhập Station ID..."
                  className="w-full h-11 px-4 rounded-lg border-2 border-amber-300 text-black placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('scan-new')}
                className="flex-1 h-14 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
              >
                Quay lại
              </button>
              <button
                onClick={confirmSwap}
                className="flex-1 h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all hover:shadow-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                Xác nhận Hoàn tất
              </button>
              <button
                onClick={openReport}
                className="h-14 px-6 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 font-bold ring-2 ring-rose-200 hover:from-rose-100 hover:to-red-100 transition-all flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Báo lỗi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý giao dịch...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      )}

      {/* Completed */}
      {step === 'completed' && (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-2xl">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Đổi pin thành công!</h2>
          <p className="text-lg text-gray-600 mb-6">Giao dịch đã được ghi nhận</p>
          
          <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <div className="text-gray-600 mb-1">Pin cũ</div>
                <div className="font-semibold text-rose-700">{oldId}</div>
              </div>
              <div className="text-left">
                <div className="text-gray-600 mb-1">Pin mới</div>
                <div className="font-semibold text-emerald-700">{newId}</div>
              </div>
            </div>
            {lastCreatedTransferId && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                Transfer ID: <span className="font-mono font-semibold">{lastCreatedTransferId}</span>
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-blue-600 font-medium">
            Tự động reset sau 3 giây...
          </div>
        </div>
      )}
      {/* Report Issue Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportOpen(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Báo cáo sự cố</h3>
                <p className="text-sm text-gray-600">Ghi nhận và hoàn tác giao dịch</p>
              </div>
            </div>

            {lastCreatedTransferId && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Transfer ID</div>
                <div className="font-mono font-semibold text-gray-900">{lastCreatedTransferId}</div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại sự cố</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)} 
                  className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 text-black focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all"
                >
                  <option value="Issue">Sự cố chung</option>
                  <option value="CustomerCancel">Khách hủy</option>
                  <option value="HardwareFault">Lỗi thiết bị</option>
                  <option value="BatteryDefect">Pin lỗi</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Chi tiết / Lý do</label>
                <textarea 
                  value={reportReason} 
                  onChange={(e) => setReportReason(e.target.value)} 
                  placeholder="Mô tả vấn đề gặp phải..." 
                  className="w-full rounded-lg border-2 border-gray-200 p-3 text-sm h-32 text-black placeholder:text-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setReportOpen(false)} 
                className="flex-1 h-11 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button 
                onClick={submitReport} 
                className="flex-1 h-11 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg hover:from-rose-600 hover:to-red-700 transition-all hover:shadow-xl flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Ghi nhận & Hoàn tác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
