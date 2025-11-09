/**
 * ScanStep Component
 * Step 1: Scan/enter booking code
 */

import { QrCode } from 'lucide-react';
import { ScanStepProps } from './types';

export function ScanStep({ reservationId, setReservationId, onSubmit }: ScanStepProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 shadow-lg">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Booking</h2>
        <p className="text-gray-600">Enter booking code to start check-in</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Code</label>
          <input
            type="text"
            value={reservationId}
            onChange={(e) => setReservationId(e.target.value)}
            placeholder="E.g: RES123"
            className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            onKeyPress={handleKeyPress}
            autoFocus
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!reservationId.trim()}
          className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Search
        </button>
      </div>
    </div>
  );
}


