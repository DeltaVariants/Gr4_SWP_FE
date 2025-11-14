"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "@/application/hooks/useRedux";
import { fetchAllVehicles } from "@/application/services/vehicleService";
import { fetchAllBatteryTypes } from "@/application/services/batteryTypeService";
import { fetchAllStations } from "@/application/services/stationService";
import { bookingRepositoryAPI } from "@/infrastructure/repositories/BookingRepositoryAPI.impl";
import { createBookingUseCase } from "@/application/usecases/booking";
import { Booking } from "@/domain/entities/Booking";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCar,
  FaBatteryFull,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

const BookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Get vehicle, battery types and stations from Redux
  const { selectedVehicle, vehicles } = useAppSelector(
    (state) => state.vehicle
  );
  const { batteryTypes } = useAppSelector((state) => state.batteryType);
  const { stations } = useAppSelector((state) => state.station);

  // State management
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [error, setError] = useState<string>("");

  // Booking form data
  const [stationId, setStationId] = useState("");
  const [stationName, setStationName] = useState("");
  const [bookingTime, setBookingTime] = useState<Date>(new Date());

  // Initialize booking time to current time + 2 hours
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    now.setMinutes(0);
    now.setSeconds(0);
    setBookingTime(now);
  }, []);

  // Get station info from URL params and find station name from Redux
  useEffect(() => {
    const stationIdParam = searchParams.get("stationId");
    const stationNameParam = searchParams.get("stationName");

    if (stationIdParam) {
      setStationId(stationIdParam);
      if (stationNameParam) {
        setStationName(stationNameParam);
      } else {
        // Find station name from Redux stations
        const station = stations.find((s) => s.stationID === stationIdParam);
        if (station) {
          setStationName(station.stationName);
        }
      }
    }
  }, [searchParams, stations]);

  // Fetch vehicles, battery types and stations if not loaded
  useEffect(() => {
    if (!selectedVehicle && vehicles.length === 0) {
      dispatch(fetchAllVehicles());
    }
    if (batteryTypes.length === 0) {
      dispatch(fetchAllBatteryTypes());
    }
    if (stations.length === 0) {
      dispatch(fetchAllStations());
    }
  }, [
    dispatch,
    selectedVehicle,
    vehicles,
    batteryTypes.length,
    stations.length,
  ]);

  const handleCreateBooking = async () => {
    // Check if dev mode or has API token
    const devToken = process.env.NEXT_PUBLIC_API_TOKEN;
    const isDevMode = Boolean(devToken);

    // In dev mode or if not authenticated, use dummy user
    const userId = user?.id || (isDevMode ? "12345" : null);

    if (!userId) {
      setError("Vui lòng đăng nhập để đặt lịch");
      router.push("/login?redirect=/booking");
      return;
    }

    if (!selectedVehicle) {
      setError("Vui lòng chọn xe");
      return;
    }

    if (!stationId) {
      setError("Vui lòng chọn trạm đổi pin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookingRequest = {
        userID: userId,
        vehicleID: selectedVehicle.vehicleID,
        stationID: stationId,
        batteryTypeID: selectedVehicle.batteryTypeID,
        bookingDays: bookingTime.getDate(),
        bookingMonth: bookingTime.getMonth() + 1,
        bookingYear: bookingTime.getFullYear(),
        bookingHour: bookingTime.getHours(),
        bookingMinute: bookingTime.getMinutes(),
      };

      const result = await createBookingUseCase(
        bookingRepositoryAPI,
        bookingRequest
      );

      setBookingData(result);
      setBookingSuccess(true);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err instanceof Error ? err.message : "Không thể tạo booking");
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayTime = (date: Date) => {
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Success screen
  if (bookingSuccess && bookingData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt lịch thành công!
            </h1>
            <p className="text-gray-600">
              Mã đặt lịch:{" "}
              <span className="font-mono font-semibold">
                {bookingData.bookingID}
              </span>
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <FaCar className="text-indigo-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Xe</p>
                <p className="font-semibold text-gray-900">
                  {bookingData.vehicleName}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <FaMapMarkerAlt className="text-red-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Trạm</p>
                <p className="font-semibold text-gray-900">
                  {bookingData.stationName}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <FaBatteryFull className="text-green-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Loại pin</p>
                <p className="font-semibold text-gray-900">
                  {bookingData.batteryType}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
              <FaCalendarAlt className="text-blue-600 text-xl mt-1" />
              <div>
                <p className="text-sm text-gray-600">Thời gian đặt</p>
                <p className="font-semibold text-gray-900">
                  {new Date(bookingData.bookingTime).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gói thanh toán</p>
                  <p className="font-semibold text-indigo-900 text-lg capitalize">
                    {bookingData.planName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="font-semibold text-green-700 capitalize">
                    {bookingData.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/history")}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Xem lịch sử đặt lịch
            </button>
            <button
              onClick={() => router.push("/home")}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-5xl text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang xử lý đặt lịch...</p>
        </div>
      </div>
    );
  }

  // Booking form
  return (
    <div className="h-full overflow-y-auto bg-linear-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Đặt lịch đổi pin
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Vehicle Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <FaCar className="text-indigo-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin xe
                </h2>
              </div>
              {selectedVehicle ? (
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tên xe:</span>{" "}
                    {selectedVehicle.vehicleName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Biển số:</span>{" "}
                    {selectedVehicle.licensePlate}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Loại pin:</span>{" "}
                    {(() => {
                      const batteryType = batteryTypes.find(
                        (bt) =>
                          bt.batteryTypeID === selectedVehicle.batteryTypeID
                      );
                      return batteryType
                        ? `${batteryType.batteryTypeModel} (${batteryType.batteryTypeCapacity}kWh)`
                        : "N/A";
                    })()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Chưa chọn xe.{" "}
                  <button
                    onClick={() => router.push("/home")}
                    className="text-indigo-600 hover:underline"
                  >
                    Chọn xe
                  </button>
                </p>
              )}
            </div>

            {/* Station Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <FaMapMarkerAlt className="text-red-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Trạm đổi pin
                </h2>
              </div>
              {stationId ? (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Trạm:</span>{" "}
                  {stationName || stationId}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Chưa chọn trạm.{" "}
                  <button
                    onClick={() => router.push("/findstation")}
                    className="text-indigo-600 hover:underline"
                  >
                    Tìm trạm
                  </button>
                </p>
              )}
            </div>

            {/* Booking Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <FaClock className="text-blue-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Thời gian đổi pin
                </h2>
              </div>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Thời gian đặt lịch:
                  </p>
                  <p className="text-base font-bold text-blue-700">
                    {formatDisplayTime(bookingTime)}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    (Tự động đặt sau 2 giờ kể từ bây giờ)
                  </p>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">⚠️ Lưu ý:</span> Vui lòng
                    đến trạm trước thời gian đã đặt ít nhất 2 tiếng. Lịch đặt sẽ
                    tự động hủy nếu bạn không đến đúng giờ.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <FaBatteryFull className="text-indigo-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Gói thanh toán
                </h2>
              </div>
              <p className="text-sm text-gray-700 mb-1.5">
                <span className="font-semibold">Gói hiện tại:</span>{" "}
                Pay-per-swap (Thanh toán theo lượt)
              </p>
              <p className="text-xs text-gray-600">
                Bạn sẽ thanh toán sau khi hoàn thành việc đổi pin
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
            >
              Quay lại
            </button>
            <button
              onClick={handleCreateBooking}
              disabled={!selectedVehicle || !stationId || loading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors text-sm ${
                !selectedVehicle || !stationId || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt lịch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
