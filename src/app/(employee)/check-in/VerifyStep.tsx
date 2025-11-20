/**
 * VerifyStep Component
 * Step 2: Verify booking information
 */

import { User, Car, Battery, AlertCircle, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { VerifyStepProps } from './types';

export function VerifyStep({
  reservationId,
  bookingData,
  driverName,
  vehicle,
  batteryType,
  loading,
  onVerify,
  onBack,
}: VerifyStepProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Booking ID</div>
          <div className="text-xl font-bold text-gray-900">{reservationId}</div>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 ring-1 ring-orange-200">
          <AlertCircle className="w-4 h-4" />
          Verify
        </span>
      </div>

      {loading && !bookingData ? (
        <div className="py-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading information...</p>
        </div>
      ) : !bookingData ? (
        <div className="py-12 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Not Found</h3>
          <p className="text-gray-600 mb-6">
            Code &quot;{reservationId}&quot; does not exist
          </p>
          <button
            onClick={onBack}
            className="h-11 px-8 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
          >
            Back
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-blue-500" />
                Customer
              </label>
              <input
                type="text"
                value={driverName}
                readOnly
                className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Car className="w-4 h-4 text-blue-500" />
                Vehicle
              </label>
              <input
                type="text"
                value={vehicle}
                readOnly
                className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Battery className="w-4 h-4 text-blue-500" />
                Battery Type
              </label>
              <input
                type="text"
                value={batteryType}
                readOnly
                className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Debug info - remove in production */}
          {(loading || !driverName) && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
              <div className="font-semibold mb-1">Debug Info:</div>
              <div>Loading: {loading ? 'Yes' : 'No'}</div>
              <div>Driver Name: {driverName || '(empty)'}</div>
              {!driverName && (
                <div className="mt-2 text-yellow-700">
                  ⚠️ Waiting for customer information to load...
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="h-11 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={onVerify}
              disabled={loading || !driverName}
              className="flex-1 h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title={loading ? 'Processing...' : !driverName ? 'Please wait for customer information to load' : 'Continue to swap step'}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Continue
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}


