import React from "react";

interface BatteryAlertProps {
  batteryPercentage: number;
  range: number;
  onFindStation: () => void;
  onDismiss: () => void;
}

export default function BatteryAlert({
  batteryPercentage,
  range,
  onFindStation,
  onDismiss,
}: BatteryAlertProps) {
  return (
    <div className="bg-white border-l-4 border-black rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-black">
              Low Battery Alert
            </h3>
            <p className="text-sm text-black">
              Current: {batteryPercentage}% • Range: ~{range} km
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onFindStation}
            className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Find Station
          </button>
          <button
            onClick={onDismiss}
            className="bg-white border border-black text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
