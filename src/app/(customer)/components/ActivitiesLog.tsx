"use client";
import React from "react";
import { FaRegClock, FaChevronRight } from "react-icons/fa";

interface Activity {
  id: string;
  type: "completed" | "canceled" | "scheduled";
  message: string;
  timestamp: string;
}

interface ActivitiesLogProps {
  activities?: Activity[];
  onViewAll?: () => void;
}

export default function ActivitiesLog({
  activities = [
    {
      id: "1",
      type: "completed",
      message: "Swap Completed",
      timestamp: "9:30 25/10",
    },
    {
      id: "2",
      type: "canceled",
      message: "Swap Canceled",
      timestamp: "9:30 25/10",
    },
    {
      id: "3",
      type: "completed",
      message: "Swap Completed",
      timestamp: "9:30 25/10",
    },
    {
      id: "4",
      type: "completed",
      message: "Swap Completed",
      timestamp: "9:30 25/10",
    },
  ],
  onViewAll,
}: ActivitiesLogProps) {
  const getActivityColor = (type: string) => {
    switch (type) {
      case "completed":
        return "text-teal-700";
      case "canceled":
        return "text-orange-700";
      case "scheduled":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-100 h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-start mb-2">
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-lg font-semibold text-gray-800 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded-lg transition-all duration-200"
          >
            <span>Activities</span>
            <FaChevronRight size={14} />
          </button>
        </div>

        {/* Activities List */}
        <div className="pl-2 flex-1 space-y-1 overflow-y-auto max-h-24 scrollbar-hide">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between gap-1 border-b-2 pb-2"
            >
              {/* Left: Activity message */}
              <div className="flex items-center">
                <div
                  className={`text-sm font-medium ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {activity.message}
                </div>
              </div>

              {/* Right: Timestamp */}
              <div className="text-xs text-gray-500 flex items-center">
                <FaRegClock size={12} />
                <span>{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
