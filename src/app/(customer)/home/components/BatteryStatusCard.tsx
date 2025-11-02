"use client";
import React from "react";
import BatteryCircle from "./BatteryCircle";

interface BatteryStatusCardProps {
  batteryLevel?: number;
  remainingRange?: number;
  onFindStation?: () => void;
}

export default function BatteryStatusCard({
  batteryLevel = 20,
  remainingRange = 156,
  onFindStation,
}: BatteryStatusCardProps) {
  const showAlert = batteryLevel <= 40;

  return (
    <div className="flex justify-center items-center overflow-visible">
      {/* Left Section - Range and Alert */}
      <div className="flex flex-col justify-center pr-6 p-5 gap-3 text-right">
        {/* Remaining Range */}
        <div className="flex flex-col items-end justify-center -mb-2">
          <div className="text-xs text-gray-500">Remaining Range</div>
          <div className="text-2xl font-bold text-gray-900 ">
            {remainingRange}
            <span className=" text-lg text-gray-500"> km</span>
          </div>
        </div>

        {/* Alert Section - only show if battery <= 40% */}
        {showAlert && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-100 ">
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-700 uppercase">
                LOW BATTERY
              </div>
            </div>
            <button
              onClick={onFindStation}
              className="px-4 py-2 bg-white border border-yellow-700 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100 transition-colors"
            >
              Find Station
            </button>
          </div>
        )}
      </div>

      {/* Right Section - Battery Circle */}
      <div className="flex items-center scale-130">
        <BatteryCircle percentage={batteryLevel} />
      </div>
    </div>
  );
}
