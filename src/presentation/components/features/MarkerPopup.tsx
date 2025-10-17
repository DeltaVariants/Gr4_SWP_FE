import React from "react";

interface MarkerPopupProps {
  stationName: string;
  address: string;
  status: boolean;
  availableSlots: number;
  totalSlots: number;
  onDirection: () => void;
  onClearRoute: () => void;
}

const MarkerPopup: React.FC<MarkerPopupProps> = ({
  stationName,
  address,
  status,
  availableSlots,
  totalSlots,
  onDirection,
  onClearRoute,
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

      <div className="flex gap-2">
        <button
          onClick={onDirection}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Direction
        </button>
        <button
          onClick={onClearRoute}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MarkerPopup;
