"use client";
import React from "react";
import { FaSearch } from "react-icons/fa";

interface Station {
  id: string;
  name: string;
  address: string;
  distance: string;
  imageUrl?: string;
}

interface RecentStationsListProps {
  stations?: Station[];
  onSearch?: () => void;
  onStationSelect?: (station: Station) => void;
}

export default function RecentStationsList({
  stations = [
    {
      id: "1",
      name: "Nhà Văn hóa Sinh viên",
      address:
        "Số 1 Lưu Hữu Phước, Đồng Hoà, Dĩ An, Thành phố Hồ Chí Minh, Việt Nam",
      distance: "~2km",
    },
    {
      id: "2",
      name: "Nhà Văn hóa Sinh viên",
      address:
        "Số 1 Lưu Hữu Phước, Đồng Hoà, Dĩ An, Thành phố Hồ Chí Minh, Việt Nam",
      distance: "~2km",
    },
    {
      id: "3",
      name: "Nhà Văn hóa Sinh viên",
      address:
        "Số 1 Lưu Hữu Phước, Đồng Hoà, Dĩ An, Thành phố Hồ Chí Minh, Việt Nam",
      distance: "~2km",
    },
  ],
  onSearch,
  onStationSelect,
}: RecentStationsListProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Stations
          </h3>
          <button
            onClick={onSearch}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaSearch size={16} />
          </button>
        </div>

        {/* Stations List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {stations.map((station) => (
            <div
              key={station.id}
              onClick={() => onStationSelect?.(station)}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Station Image */}
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={station.imageUrl || "/logo.png"}
                  alt={station.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Station Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate">
                  {station.name}
                </h4>
                <p
                  className="text-sm text-gray-500 overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {station.address}
                </p>
              </div>

              {/* Distance */}
              <div className="text-sm text-gray-600 font-medium">
                {station.distance}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
