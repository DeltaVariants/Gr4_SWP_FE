import React from "react";

interface CarCardProps {
  brand: string;
  model: string;
  batteryPercentage: number;
  range: number;
  unit?: string;
}

export default function CarCard({
  brand,
  model,
  batteryPercentage,
  range,
  unit = "km",
}: CarCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 w-52 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#295E9C]">{brand}</h3>
          <p className="text-sm text-[#7B849C] leading-6">{model}</p>
        </div>
        <div className="w-18 h-10 bg-[#C0C0C0] rounded-lg flex items-center justify-center">
          <svg
            className="w-8 h-6 text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
          </svg>
        </div>
      </div>

      <hr className="border-gray-200/40 mb-4" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#7B849C] font-normal leading-6">
            Battery
          </p>
          <p className="text-xl font-bold text-[#3DAD10] leading-6">
            {batteryPercentage}%
          </p>
        </div>
        <div>
          <p className="text-xs text-[#7B849C] font-normal leading-6">Range</p>
          <p className="text-xl font-bold text-[#7B849C] leading-6">
            {range} {unit}
          </p>
        </div>
      </div>
    </div>
  );
}
