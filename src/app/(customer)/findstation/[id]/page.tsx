"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBolt,
  FaMapMarkerAlt,
  FaClock,
  FaCar,
} from "react-icons/fa";
import { getAllStationsUseCase } from "@/application/usecases/station/GetAllStations.usecase";
import { stationRepositoryAPI } from "@/infrastructure/repositories/StationRepositoryAPI.impl";
import { Station } from "@/domain/entities/Station";
import { useAppSelector, useAppDispatch } from "@/application/hooks/useRedux";
import { fetchAllVehicles } from "@/application/services/vehicleService";
import { fetchAllBatteryTypes } from "@/application/services/batteryTypeService";

export default function StationBookingPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const stationId = params.id as string;

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  // Get vehicle info and battery types from Redux
  const { selectedVehicle } = useAppSelector((state) => state.vehicle);
  const { batteryTypes } = useAppSelector((state) => state.batteryType);

  // Fetch vehicles and battery types when component mounts if not already loaded
  useEffect(() => {
    if (!selectedVehicle) {
      dispatch(fetchAllVehicles());
    }
    if (batteryTypes.length === 0) {
      dispatch(fetchAllBatteryTypes());
    }
  }, [dispatch, selectedVehicle, batteryTypes.length]);

  useEffect(() => {
    const fetchStationDetails = async () => {
      try {
        setLoading(true);
        const stations = await getAllStationsUseCase(stationRepositoryAPI);
        const foundStation = stations.find((s) => s.stationID === stationId);
        setStation(foundStation || null);

        // Update URL with station name for breadcrumb
        if (foundStation) {
          const url = new URL(window.location.href);
          url.searchParams.set("name", foundStation.stationName);
          window.history.replaceState({}, "", url);
        }
      } catch (error) {
        console.error("Error fetching station:", error);
      } finally {
        setLoading(false);
      }
    };

    if (stationId) {
      fetchStationDetails();
    }
  }, [stationId]);

  const handleBooking = () => {
    if (!station || !selectedVehicle) {
      alert("Vui lòng đảm bảo đã chọn xe");
      return;
    }

    // Calculate booking time: current time + 2 hours
    const bookingTime = new Date();
    bookingTime.setHours(bookingTime.getHours() + 2);

    const bookingDate = bookingTime.toISOString().split("T")[0];
    const bookingTimeString = bookingTime.toTimeString().slice(0, 5);

    // Navigate to booking page with station info and battery type from vehicle
    router.push(
      `/booking?stationId=${
        station.stationID
      }&date=${bookingDate}&time=${bookingTimeString}&batteryType=${
        selectedVehicle.batteryTypeModel || "Medium"
      }`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screenflex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin trạm...</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy trạm
          </h2>
          <p className="text-gray-600 mb-6">
            Trạm bạn đang tìm không tồn tại hoặc đã bị xóa
          </p>
          <button
            onClick={() => router.push("/findstation")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Quay lại tìm trạm
          </button>
        </div>
      </div>
    );
  }

  const availabilityPercentage = Math.round(
    (station.batteryInSlots / station.slotNumber) * 100
  );

  return (
    <div className="h-full">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
      >
        <FaArrowLeft />
        <span>Quay lại</span>
      </button>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-3rem)]">
        {/* Left Column - Station Info */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
          {/* Station Header */}
          <div className="bg-linear-to-r from-indigo-600 to-indigo-800 text-white p-4">
            <h1 className="text-2xl font-bold mb-2">{station.stationName}</h1>
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-1 shrink-0" />
              <p className="text-indigo-100 text-sm">
                {station.stationLocation}
              </p>
            </div>
          </div>

          {/* Station Details - Scrollable if needed */}
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Available Batteries */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FaBolt className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pin có sẵn</p>
                    <p className="text-xl font-bold text-green-700">
                      {station.batteryInSlots}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Slots */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {station.slotNumber}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Tổng số slot</p>
                    <p className="text-xl font-bold text-blue-700">
                      {station.slotNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {availabilityPercentage}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Khả dụng</p>
                    <p className="text-xl font-bold text-indigo-700">
                      {availabilityPercentage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">
                  Tình trạng pin
                </span>
                <span className="text-xs text-gray-600">
                  {station.batteryInSlots}/{station.slotNumber} pin
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-linear-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${availabilityPercentage}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Status Message */}
            {station.batteryInSlots > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 font-medium text-sm">
                  ✓ Trạm này đang có pin sẵn để đổi
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 font-medium text-sm">
                  ✗ Trạm này hiện không có pin sẵn
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking Form */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaClock className="text-indigo-600" />
            Đặt lịch đổi pin
          </h2>

          <div className="space-y-4 flex-1">
            {/* Vehicle Information */}
            {selectedVehicle ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaCar className="text-indigo-600 mt-1 shrink-0 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Thông tin xe
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Mẫu xe:</span>
                        <span className="text-xs font-medium text-gray-800">
                          {selectedVehicle.vehicleName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Biển số:</span>
                        <span className="text-xs font-medium text-gray-800">
                          {selectedVehicle.licensePlate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Loại pin:</span>
                        <span className="text-xs font-medium text-indigo-700">
                          {(() => {
                            const batteryType = batteryTypes.find(
                              (bt) =>
                                bt.batteryTypeID ===
                                selectedVehicle.batteryTypeID
                            );
                            return batteryType
                              ? `${batteryType.batteryTypeModel} (${batteryType.batteryTypeCapacity}kWh)`
                              : "N/A";
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Chưa có thông tin xe. Vui lòng thêm xe trong phần quản lý
                  xe.
                </p>
              </div>
            )}

            {/* Booking Time Info */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaClock className="text-indigo-600 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    Thời gian đổi pin
                  </p>
                  <p className="text-sm text-gray-600">
                    Bạn có tối đa{" "}
                    <strong className="text-indigo-700">2 giờ</strong> kể từ lúc
                    đặt lịch để đến trạm đổi pin.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Thời gian bắt đầu: Sau khi xác nhận đặt lịch
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Button */}
            <button
              onClick={handleBooking}
              disabled={!selectedVehicle || station.batteryInSlots === 0}
              className="w-full bg-linear-to-r from-indigo-600 to-indigo-800 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {!selectedVehicle
                ? "Chưa có thông tin xe"
                : station.batteryInSlots === 0
                ? "Trạm hết pin"
                : "Đặt lịch ngay"}
            </button>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Lưu ý:</strong> Vui lòng đến trong vòng 2 giờ sau khi
                đặt lịch. Nếu muốn hủy lịch, vui lòng thực hiện trước 30 phút.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
