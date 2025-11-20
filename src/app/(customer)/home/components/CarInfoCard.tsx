"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TbRefresh } from "react-icons/tb";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { fetchAllVehicles } from "@/application/services/vehicleService";
import { setSelectedVehicle } from "@/application/slices/vehicleSlice";
import { fetchAllBatteryTypes } from "@/application/services/batteryTypeService";
import VehicleSelectionModal from "./VehicleSelectionModal";

interface CarInfoProps {
  onSwap?: () => void; // callback khi nhấn nút Swap
}

const CarInfoCard: React.FC<CarInfoProps> = ({ onSwap }) => {
  const dispatch = useAppDispatch();
  const { vehicles, selectedVehicle, loading, error } = useAppSelector(
    (state) => state.vehicle
  );
  const { batteryTypes } = useAppSelector((state) => state.batteryType);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch vehicles and battery types khi component mount
  useEffect(() => {
    dispatch(fetchAllVehicles());
    if (batteryTypes.length === 0) {
      dispatch(fetchAllBatteryTypes());
    }
  }, [dispatch, batteryTypes.length]);

  // Handle open modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
    onSwap?.();
  };

  // Handle select vehicle from modal
  const handleSelectVehicle = (vehicle: typeof selectedVehicle) => {
    if (vehicle) {
      dispatch(setSelectedVehicle(vehicle));
    }
  };

  // Loading state
  if (loading && !selectedVehicle) {
    return (
      <div className="relative flex items-center justify-center gap-4 rounded-2xl bg-linear-to-br from-gray-200 to-gray-300 px-2 my-10 ml-20 shadow-lg h-40">
        <p className="text-gray-600">Đang tải thông tin xe...</p>
      </div>
    );
  }

  // Error state
  if (error && !selectedVehicle) {
    return (
      <div className="relative flex items-center justify-center gap-4 rounded-2xl bg-linear-to-br from-red-100 to-red-200 px-2 my-10 ml-20 shadow-lg h-40">
        <p className="text-red-600">Lỗi: {error}</p>
      </div>
    );
  }

  // No vehicle state
  if (!selectedVehicle) {
    return (
      <div className="relative flex items-center justify-center gap-4 rounded-2xl bg-linear-to-br from-gray-200 to-gray-300 px-2 my-10 ml-20 shadow-lg h-40">
        <p className="text-gray-600">Không có thông tin xe</p>
      </div>
    );
  }

  const carImage = "/car.png"; // Default image
  const carModel = selectedVehicle.vehicleName;
  const licensePlate = selectedVehicle.licensePlate;

  // Get battery type info
  const batteryTypeInfo = batteryTypes.find(
    (bt) => bt.batteryTypeID === selectedVehicle.batteryTypeID
  );
  const batteryType = batteryTypeInfo
    ? `${batteryTypeInfo.batteryTypeModel} (${batteryTypeInfo.batteryTypeCapacity}kWh)`
    : "Loading...";

  return (
    <div className="relative flex items-center gap-4 rounded-2xl bg-linear-to-br from-gray-200 to-gray-300 px-2 my-10 ml-20 shadow-lg overflow-visible">
      {/* Hình xe - tràn ra ngoài một chút */}
      <div className="relative shrink-0 w-1/2 -ml-14 flex items-center justify-center">
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
            onClick={handleOpenModal}
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-600 hover:bg-gray-600 hover:text-white transition-all duration-200 shrink-0"
            aria-label="Swap car"
            disabled={vehicles.length <= 1}
          >
            <TbRefresh size={18} />
          </button>
        </div>
        <p className="text-lg font-medium text-gray-800">{licensePlate}</p>
        <p className="text-base text-gray-600">{batteryType}</p>
      </div>

      {/* Vehicle Selection Modal */}
      <VehicleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicle?.vehicleID || null}
        onSelectVehicle={handleSelectVehicle}
        loading={loading}
      />
    </div>
  );
};

export default CarInfoCard;
