'use client';
import { useSearchParams } from 'next/navigation';

export default function CheckInContent() {
  const params = useSearchParams();
  const reservationId = params.get('reservationId');
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-sm ring-1 ring-gray-200 max-w-3xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Reservation</div>
          <div className="font-semibold text-gray-900">{reservationId || '—'}</div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200">Verify</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Driver Name</label>
          <input className="w-full h-10 rounded-md border-gray-300 text-black placeholder:text-gray-500 focus:border-[#0062FF] focus:ring-[#0062FF]" placeholder="Enter name" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          <input className="w-full h-10 rounded-md border-gray-300 text-black placeholder:text-gray-500 focus:border-[#0062FF] focus:ring-[#0062FF]" placeholder="Enter phone" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Vehicle</label>
          <input className="w-full h-10 rounded-md border-gray-300 text-black placeholder:text-gray-500 focus:border-[#0062FF] focus:ring-[#0062FF]" placeholder="Model" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Battery Type</label>
          <input className="w-full h-10 rounded-md border-gray-300 text-black placeholder:text-gray-500 focus:border-[#0062FF] focus:ring-[#0062FF]" placeholder="e.g., 60V-26Ah" />
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-end gap-3">
          <button className="h-10 px-4 rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
          <a href="/swap" className="h-10 px-4 rounded-md bg-[#0062FF] text-white hover:bg-[#0052d6] shadow-sm">Start Swap</a>
        </div>
      </div>
    </div>
  );
}
