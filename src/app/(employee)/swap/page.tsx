"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import transferService from '@/services/transferService';
import { useToast } from '@/presentation/components/ui/Notification';

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

export default function SwapPage() {
  const [oldId, setOldId] = useState('');
  const [newId, setNewId] = useState('');
  const [step, setStep] = useState<'scan-old' | 'scan-new' | 'confirm'>('scan-old');
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportType, setReportType] = useState('Issue');
  const [lastCreatedTransferId, setLastCreatedTransferId] = useState<string | null>(null);

  const next = () => {
    if (step === 'scan-old') setStep('scan-new');
    else if (step === 'scan-new') setStep('confirm');
  };

  const confirmSwap = async () => {
    try {
      // get stationId from user or fallback to /api/auth/me
  let stationId = undefined as string | undefined;
  const u = user as Record<string, unknown> | null;
  if (u) stationId = (u['stationId'] as string | undefined) || undefined;
      if (!stationId && typeof window !== 'undefined') {
        try {
          const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
          const mePayload = await meRes.json().catch(() => ({}));
          if (meRes.ok && mePayload?.success && mePayload.data) {
            const d = mePayload.data as Record<string, unknown>;
            stationId = (d['stationId'] || d['StationID'] || d['stationID'] || d['StationId']) as string | undefined;
          }
        } catch (e) {}
      }

      // Không có stationId vẫn tiếp tục: proxy /api/transfer/create sẽ tự fallback bằng stationName -> stationId

      const payload = {
        oldBatteryId: oldId,
        newBatteryId: newId,
        // Truyền stationId nếu có; nếu không, proxy sẽ cố gắng map từ stationName của tài khoản
        ...(stationId ? { stationId } : {}),
      };

      const created = await transferService.createTransfer(payload) as Record<string, unknown> | null;
      // Optionally immediately mark as completed if backend requires
      if (created && (created['transferId'] as string | undefined)) {
        try {
          await transferService.updateTransferStatus(String(created['transferId']), { status: 'Completed' });
          // persist to local log for UI reporting
          const log = {
            transferId: created['transferId'],
            oldBatteryId: oldId,
            newBatteryId: newId,
            stationId,
            status: 'Completed',
            createdAt: new Date().toISOString(),
            raw: created,
          };
          try { pushLocalTransfer(log); setLastCreatedTransferId(String(created['transferId'])); } catch (e) {}
        } catch (e) {
          // ignore update error but inform user
          let msg = 'Unknown error';
          if (e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)) msg = String((e as Record<string, unknown>)['message']);
          else msg = String(e);
          showToast({ type: 'info', message: 'Swap created but failed to update status: ' + msg });
          setStep('scan-old');
          setOldId('');
          setNewId('');
          return;
        }
      }

      showToast({ type: 'success', message: 'Swap created successfully' });
      setStep('scan-old');
      setOldId('');
      setNewId('');
    } catch (error: unknown) {
      let msg = 'Failed to create swap';
      if (error && typeof error === 'object' && 'message' in (error as Record<string, unknown>)) msg = String((error as Record<string, unknown>)['message']);
      else msg = String(error || msg);
      showToast({ type: 'error', message: msg });
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
      // Optionally rollback immediately (call backend to cancel)
      try {
        await transferService.updateTransferStatus(transferId, { status: 'Cancelled' });
        updateLocalTransferStatus(transferId, { status: 'Cancelled' });
        showToast({ type: 'success', message: 'Exception recorded and transfer rolled back' });
      } catch (e) {
        showToast({ type: 'info', message: 'Exception recorded locally but rollback failed: ' + (e as Error).message });
      }
      setReportOpen(false);
    } catch (e) {
      showToast({ type: 'error', message: 'Failed to record exception' });
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl shadow p-6 max-w-3xl">
        {step === 'scan-old' && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Scan old battery ID (OUT)</div>
            <input className="w-full rounded-md border-gray-300 text-black placeholder:text-gray-500" value={oldId} onChange={(e) => setOldId(e.target.value)} placeholder="Scan or enter..." />
            <div className="mt-4">
              <button disabled={!oldId} onClick={next} className="px-4 py-2 rounded-md bg-[#0062FF] text-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
        {step === 'scan-new' && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Scan new battery ID (IN)</div>
            <input className="w-full rounded-md border-gray-300 text-black placeholder:text-gray-500" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="Scan or enter..." />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setStep('scan-old')} className="px-4 py-2 rounded-md border border-gray-300">Back</button>
              <button disabled={!newId} onClick={next} className="px-4 py-2 rounded-md bg-[#0062FF] text-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
        {step === 'confirm' && (
          <div>
            <div className="text-sm text-gray-600">Old Battery</div>
            <div className="font-medium mb-3">{oldId}</div>
            <div className="text-sm text-gray-600">New Battery</div>
            <div className="font-medium mb-6">{newId}</div>
            <div className="flex gap-3">
              <button onClick={() => setStep('scan-new')} className="px-4 py-2 rounded-md border border-gray-300">Back</button>
              <button onClick={confirmSwap} className="px-4 py-2 rounded-md bg-emerald-600 text-white">Confirm Completion</button>
              <button onClick={openReport} className="px-4 py-2 rounded-md bg-rose-50 text-rose-700 ring-1 ring-rose-200">Report Issue</button>
            </div>
          </div>
        )}
      </div>
      {/* Report Issue Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReportOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-[480px] shadow-lg">
            <h3 className="text-lg font-semibold">Record Exception / Issue</h3>
            <div className="mt-3 text-sm text-gray-600">Transfer ID: <span className="font-medium">{lastCreatedTransferId || '—'}</span></div>
            <div className="mt-4">
              <label className="block text-xs text-gray-600">Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="mt-2 w-full h-9 rounded-md border-gray-200">
                <option value="Issue">Issue</option>
                <option value="CustomerCancel">Customer Cancel</option>
                <option value="HardwareFault">Hardware Fault</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-600">Details / Reason</label>
              <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe the problem" className="mt-2 w-full rounded-md border-gray-200 p-2 text-sm h-28" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setReportOpen(false)} className="px-4 py-2 rounded-md bg-gray-100">Cancel</button>
              <button onClick={submitReport} className="px-4 py-2 rounded-md bg-rose-600 text-white">Record & Rollback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
