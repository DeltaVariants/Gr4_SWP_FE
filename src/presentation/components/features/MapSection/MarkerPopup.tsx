import React from "react";

interface MarkerPopupProps {
  stationName: string;
  address: string;
  status: boolean;
  availableSlots: number;
  totalSlots: number;
}

const MarkerPopup: React.FC<MarkerPopupProps> = ({
  stationName,
  address,
  status,
  availableSlots,
  totalSlots,
}) => {
  return (
    <div className="p-3 min-w-[200px]">
      <h3 className="font-semibold text-lg mb-2">{stationName}</h3>
      <p className="text-sm text-gray-600 mb-1">{address}</p>
      <p
        className={`text-sm mb-2 ${status ? "text-green-700" : "text-red-700"}`}
      >
        {status ? "Available" : "Unavailable"}
      </p>
      <p className="text-sm text-blue-600 mb-3">
        Còn trống: {availableSlots}/{totalSlots} chỗ
      </p>

      {/* Directional controls removed */}
    </div>
  );
};

export default MarkerPopup;
