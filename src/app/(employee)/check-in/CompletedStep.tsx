/**
 * CompletedStep Component
 * Final step: Display successful completion
 */

import { CheckCircle2 } from 'lucide-react';
import { CompletedStepProps } from './types';

export function CompletedStep({ driverName, onReset }: CompletedStepProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-xl animate-bounce">
        <CheckCircle2 className="w-14 h-14" />
      </div>
      <h2 className="text-4xl font-bold text-gray-900 mb-4">✅ Completed!</h2>
      <p className="text-xl text-gray-600 mb-3">
        Customer <span className="font-semibold text-gray-900">{driverName}</span> has completed swap
      </p>
      <p className="text-sm text-gray-500 mb-8">Transaction has been recorded</p>
      <button
        onClick={onReset}
        className="h-12 px-8 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
      >
        Check-in next customer
      </button>
    </div>
  );
}


