// src/presentation/components/CarInfo.tsx
import React from "react";
import Image from "next/image";
import { TbRefresh } from "react-icons/tb";

interface CarInfoProps {
  carImage?: string; // ảnh nền trong suốt
  carModel?: string; // ví dụ: "Vinfast VF9 Plus"
  carType?: string; // ví dụ: "eSUV"
  batteryType?: string; // ví dụ: "Large Battery"
  onSwap?: () => void; // callback khi nhấn nút Swap
}

const CarInfoCard: React.FC<CarInfoProps> = ({
  carImage = "/car.png",
  carModel = "Vinfast VF9 Plus",
  carType = "eSUV",
  batteryType = "Large Battery",
  onSwap,
}) => {
  return (
    <div className="relative flex items-center gap-4 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 px-2 my-10 ml-20 shadow-lg overflow-visible">
      {/* Hình xe - tràn ra ngoài một chút */}
      <div className="relative flex-shrink-0 w-1/2 -ml-14 flex items-center justify-center">
        <Image
          src={carImage}
          alt={carModel}
          width={200}
          height={100}
          className="w-1/2 h-auto object-contain scale-250"
          priority
        />
      </div>

      {/* Thông tin xe */}
      <div className="flex flex-col justify-center text-left flex-1/2 p-2 pl-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-indigo-800">{carModel}</h2>
          <button
            onClick={onSwap}
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-200 flex-shrink-0"
            aria-label="Swap car"
          >
            <TbRefresh size={18} />
          </button>
        </div>
        <p className="text-lg font-medium text-gray-800">{carType}</p>
        <p className="text-base text-gray-600">{batteryType}</p>
      </div>
    </div>
  );
};

export default CarInfoCard;
