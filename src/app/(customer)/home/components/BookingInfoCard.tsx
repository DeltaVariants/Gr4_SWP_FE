"use client";
import React from "react";

interface BookingInfoCardProps {
  date?: string;
  time?: string;
  price?: string;
  stationName?: string;
  bookingId?: string;
  address?: string;
  status?: string;
}

export default function BookingInfoCard({
  date = "Th 2, 22 thg 1, 2024",
  time = "at 10:00",
  price = "45.000 ₫",
  stationName = "Downtown Station A-01",
  bookingId = "BK001",
  address = "123 Hai Ba Trung, Hoan Kiem, Hanoi",
  status = "Confirmed",
}: BookingInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl p-2 px-4 shadow-md border-2 border-indigo-600">
      <div className="flex flex-col justify-between">
        {/* Top Row - Date/Time and Price */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-bold text-blue-700">
              {date} {time}
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-800">{price}</div>
          </div>
        </div>

        {/* Bottom Section - 2 Columns Layout */}
        <div className="grid grid-cols-3 gap-1">
          {/* Left Column (chiếm 2/3) */}
          <div className="col-span-2 space-y-1">
            <div>
              <div className="text-sm font-bold text-gray-600">
                {stationName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{address}</div>
            </div>
          </div>

          {/* Right Column (chiếm 1/3) */}
          <div className="space-y-1 justify-items-end">
            <div>
              <div className="text-sm  text-gray-700">
                Booking ID: {bookingId}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-600">
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
