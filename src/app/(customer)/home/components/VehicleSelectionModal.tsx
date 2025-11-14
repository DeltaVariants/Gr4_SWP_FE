"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Vehicle } from "@/domain/entities/Vehicle";
import { BsCheckCircleFill } from "react-icons/bs";
import { Modal } from "@/presentation/components/ui/Modal";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { fetchAllBatteryTypes } from "@/application/services/batteryTypeService";

interface VehicleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  loading?: boolean;
}

const VehicleSelectionModal: React.FC<VehicleSelectionModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  loading = false,
}) => {
  const dispatch = useAppDispatch();
  const { batteryTypes } = useAppSelector((state) => state.batteryType);

  // Fetch battery types when modal opens
  useEffect(() => {
    if (isOpen && batteryTypes.length === 0) {
      dispatch(fetchAllBatteryTypes());
    }
  }, [isOpen, dispatch, batteryTypes.length]);

  // Helper function to get battery type info
  const getBatteryTypeInfo = (batteryTypeID: string) => {
    const batteryType = batteryTypes.find(
      (bt) => bt.batteryTypeID === batteryTypeID
    );
    return batteryType
      ? `${batteryType.batteryTypeModel} (${batteryType.batteryTypeCapacity}kWh)`
      : "Unknown";
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    onSelectVehicle(vehicle);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold bg-linear-to-br from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
          Swap vehicle
        </h2>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[60vh] -mx-6 px-6 pt-1">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-600 text-lg">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-gray-600 text-lg mb-2">No vehicles available</p>
            <p className="text-gray-500 text-sm">
              Please add a vehicle to continue
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => {
              const isSelected = vehicle.vehicleID === selectedVehicleId;
              return (
                <div
                  key={vehicle.vehicleID}
                  onClick={() => handleSelectVehicle(vehicle)}
                  className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 shadow-lg scale-102"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
                  }`}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10">
                      <BsCheckCircleFill
                        size={24}
                        className="text-indigo-600"
                      />
                    </div>
                  )}

                  {/* Vehicle Image */}
                  <div className="relative h-32 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Image
                      src="/car.png"
                      alt={vehicle.vehicleName}
                      width={120}
                      height={60}
                      className="object-contain"
                    />
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-4">
                    <h3
                      className={`text-lg font-bold mb-1 ${
                        isSelected ? "text-indigo-800" : "text-gray-800"
                      }`}
                    >
                      {vehicle.vehicleName}
                    </h3>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        isSelected ? "text-indigo-700" : "text-gray-700"
                      }`}
                    >
                      {vehicle.licensePlate}
                    </p>
                    <p
                      className={`text-xs mb-2 ${
                        isSelected ? "text-indigo-600" : "text-gray-600"
                      }`}
                    >
                      {getBatteryTypeInfo(vehicle.batteryTypeID)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isSelected
                            ? "bg-indigo-200 text-indigo-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {vehicle.category || "Standard"}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-semibold text-indigo-600">
                          In Use
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default VehicleSelectionModal;
