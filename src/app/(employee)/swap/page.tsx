'use client';
import { useState } from 'react';
import { StaffShell } from '@/presentation/components/layouts/StaffShell';

export default function SwapPage() {
  const [oldId, setOldId] = useState('');
  const [newId, setNewId] = useState('');
  const [step, setStep] = useState<'scan-old' | 'scan-new' | 'confirm'>('scan-old');

  const next = () => {
    if (step === 'scan-old') setStep('scan-new');
    else if (step === 'scan-new') setStep('confirm');
  };

  return (
    <StaffShell title="Battery Swap">
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
              <a href="/" className="px-4 py-2 rounded-md bg-emerald-600 text-white">Confirm Completion</a>
            </div>
          </div>
        )}
      </div>
    </StaffShell>
  );
}
