import React from "react";

interface MarkerPopupProps {
  stationName: string;
  address: string;
  status: boolean;
  availableSlots: number;
  totalSlots: number;
  stationId?: string;
}

const MarkerPopup: React.FC<MarkerPopupProps> = ({
  stationName,
  address,
  status,
  availableSlots,
  totalSlots,
  stationId,
}) => {
  const handleBookNow = () => {
    if (stationId) {
      window.location.href = `/findstation/${stationId}`;
    }
  };

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

      {stationId && (
        <button
          onClick={handleBookNow}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
        >
          Đặt lịch
        </button>
      )}
    </div>
  );
};

export default MarkerPopup;
