"use client";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";

interface StatsSummaryCardProps {
  carbonSaved?: number;
  thisMonthSwaps?: number;
  lastMonthSwaps?: number;
  remainingSwaps?: number;
  planType?: string;
}

export default function StatsSummaryCard({
  carbonSaved = 254,
  thisMonthSwaps = 8,
  lastMonthSwaps = 6,
  remainingSwaps = 22,
  planType = "Premium Plan",
}: StatsSummaryCardProps) {
  const swapIncrease = thisMonthSwaps - lastMonthSwaps;

  return (
    <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-100">
      {/* Stats Grid */}
      <div className="flex-1 grid grid-cols-3 gap-2">
        {/* Carbon Saved */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Carbon Saved</div>
          <div className="text-2xl font-bold text-gray-900">
            {carbonSaved} kg
          </div>
        </div>

        {/* This Month Swaps */}
        <div className="text-center border-l-2 border-r-2 border-gray-200">
          <div className="text-sm text-gray-600 mb-1">This Month Swaps</div>
          <div className="text-2xl font-bold text-gray-900">
            {thisMonthSwaps}
          </div>
          {swapIncrease > 0 && (
            <div className="text-xs text-green-600 mt-1">
              +{swapIncrease} from last month
            </div>
          )}
        </div>

        {/* Remaining Swaps */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Remaining Swaps</div>
          <div className="text-2xl font-bold text-gray-900">
            {remainingSwaps}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
            {planType}
            <button
              className="inline-flex items-center justify-center text-gray-200 hover:text-gray-500 transition-colors"
              title="Plan info"
              onClick={() => alert(`Plan details: ${planType}`)}
            >
              <FaInfoCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
