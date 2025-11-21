"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { withCustomerAuth } from '@/hoc/withAuth';
import { useAuth } from "@/presentation/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "@/application/hooks/useRedux";
import { fetchAllVehicles } from "@/application/services/vehicleService";
import { fetchAllBatteryTypes } from "@/application/services/batteryTypeService";
import { fetchAllStations } from "@/application/services/stationService";
import { bookingRepositoryAPI } from "@/infrastructure/repositories/BookingRepositoryAPI.impl";
import { createBookingUseCase } from "@/application/usecases/booking";
import { BookingDTO } from "@/dto";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCar,
  FaBatteryFull,
  FaCheckCircle,
  FaSpinner,
  FaHistory,
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
  const [bookingData, setBookingData] = useState<BookingDTO | null>(null);
  const [error, setError] = useState<string>("");
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Booking form data
  const [stationId, setStationId] = useState("");
  const [stationName, setStationName] = useState("");
  const [bookingTime, setBookingTime] = useState<Date>(new Date());

  // Initialize booking time to current time
  useEffect(() => {
    const now = new Date();
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

  // Fetch all bookings
  const fetchAllBookings = async () => {
    console.log("fetchAllBookings called");
    setLoadingBookings(true);
    try {
      let token = localStorage.getItem("accessToken");
      
      // Fallback: try to get from cookie
      if (!token) {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
      
      console.log("Token exists:", !!token);
      if (!token) {
        console.log("No token found in localStorage or cookie");
        setError("Vui lòng đăng nhập lại để xem booking");
        setLoadingBookings(false);
        return;
      }

      // Get selectedVehicleId from localStorage (optional filter)
      const selectedVehicleId = localStorage.getItem("selectedVehicleId");
      
      // Build URL with query params
      // Note: Không filter theo vehicleId để lấy tất cả bookings của user
      const params = new URLSearchParams();
      // Tạm comment để lấy tất cả bookings
      // if (selectedVehicleId) {
      //   params.append("vehicleId", selectedVehicleId);
      // }
      const queryString = params.toString();
      const url = `/api/booking/get-user${queryString ? `?${queryString}` : ''}`;
      
      console.log("Fetching all bookings from:", url);
      console.log("Selected vehicle ID (not filtering):", selectedVehicleId);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("=== BOOKINGS API DEBUG ===");
      console.log("Full response:", JSON.stringify(result, null, 2));
      console.log("Response structure:", {
        success: result.success,
        hasData: !!result.data,
        dataType: typeof result.data,
        isArray: Array.isArray(result.data),
        dataKeys: result.data ? Object.keys(result.data) : null,
      });
      
      // Parse response từ proxy: { success: true, data: { success: true, message: "OK", data: [...], pagination: null } }
      if (result.success && result.data?.data && Array.isArray(result.data.data)) {
        console.log("Found bookings:", result.data.data.length);
        setAllBookings(result.data.data);
      } else if (Array.isArray(result.data)) {
        console.log("Data is array:", result.data.length);
        setAllBookings(result.data);
      } else {
        console.log("No bookings found");
        setAllBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleToggleAllBookings = () => {
    if (!showAllBookings) {
      fetchAllBookings();
    }
    setShowAllBookings(!showAllBookings);
  };

  const handleCreateBooking = async () => {
    // Check if dev mode or has API token
    const devToken = process.env.NEXT_PUBLIC_API_TOKEN;
    const isDevMode = Boolean(devToken);

    // In dev mode or if not authenticated, use dummy user
    const userId = user?.userId || (isDevMode ? "12345" : null);

    if (!userId) {
      setError("Vui lòng đăng nhập để đặt lịch");
      router.push("/login?redirect=/booking");
      return;
    }

    if (!selectedVehicle) {
      setError("Vui lòng chọn xe");
      return;
    }

    if (!stationId || !stationName) {
      setError("Vui lòng chọn trạm đổi pin");
      return;
    }

    if (!bookingTime) {
      setError("Vui lòng chọn thời gian đặt lịch");
      return;
    }

    // Validate booking time is not in the past
    const now = new Date();
    if (bookingTime < now) {
      setError("Thời gian đặt lịch không thể trong quá khứ");
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Đặt lịch đổi pin
            </h1>
            <button
              onClick={handleToggleAllBookings}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-semibold text-sm flex items-center gap-2"
            >
              <FaHistory />
              {showAllBookings ? "Ẩn danh sách" : "Xem tất cả booking"}
            </button>
          </div>

          {/* All Bookings List */}
          {showAllBookings && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách booking của bạn
              </h2>
              {loadingBookings ? (
                <div className="text-center py-4">
                  <FaSpinner className="text-2xl text-indigo-600 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Đang tải...</p>
                </div>
              ) : allBookings.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">
                  Chưa có booking nào
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allBookings.map((booking) => (
                    <div
                      key={booking.bookingID}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {booking.stationName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mã: {booking.bookingID}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Xe:</span>{" "}
                          {booking.vehicleName}
                        </div>
                        <div>
                          <span className="font-medium">Pin:</span>{" "}
                          {booking.batteryType}
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Thời gian:</span>{" "}
                          {new Date(booking.bookingTime).toLocaleString(
                            "vi-VN"
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                {/* Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngày:
                  </label>
                  <input
                    type="date"
                    value={bookingTime.toISOString().split('T')[0]}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      newDate.setHours(bookingTime.getHours());
                      newDate.setMinutes(bookingTime.getMinutes());
                      
                      // Validate if selected datetime is not in the past
                      const now = new Date();
                      
                      if (newDate < now) {
                        setError("Thời gian đặt lịch không thể trong quá khứ");
                      } else {
                        setError("");
                        setBookingTime(newDate);
                      }
                    }}
                    className="w-full px-4 py-3 text-lg font-semibold text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                {/* Time Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn giờ (00:00 - 23:59):
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Hour Select */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Giờ</label>
                      <select
                        value={bookingTime.getHours()}
                        onChange={(e) => {
                          const newDate = new Date(bookingTime);
                          newDate.setHours(parseInt(e.target.value));
                          
                          const now = new Date();
                          if (newDate < now) {
                            setError("Thời gian đặt lịch không thể trong quá khứ");
                          } else {
                            setError("");
                            setBookingTime(newDate);
                          }
                        }}
                        className="w-full px-3 py-3 text-lg font-semibold text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                          const now = new Date();
                          const selectedDate = new Date(bookingTime);
                          selectedDate.setHours(0, 0, 0, 0);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          // Disable if selected date is today and hour is in the past
                          const isDisabled = selectedDate.getTime() === today.getTime() && hour < now.getHours();
                          
                          return (
                            <option key={hour} value={hour} disabled={isDisabled} style={isDisabled ? { opacity: 0.4 } : {}}>
                              {String(hour).padStart(2, '0')}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    {/* Minute Select */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Phút</label>
                      <select
                        value={bookingTime.getMinutes()}
                        onChange={(e) => {
                          const newDate = new Date(bookingTime);
                          newDate.setMinutes(parseInt(e.target.value));
                          
                          const now = new Date();
                          if (newDate < now) {
                            setError("Thời gian đặt lịch không thể trong quá khứ");
                          } else {
                            setError("");
                            setBookingTime(newDate);
                          }
                        }}
                        className="w-full px-3 py-3 text-lg font-semibold text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                          const now = new Date();
                          const selectedDate = new Date(bookingTime);
                          selectedDate.setHours(0, 0, 0, 0);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          // Disable if selected date is today, same hour, and minute is in the past
                          const isDisabled = 
                            selectedDate.getTime() === today.getTime() && 
                            bookingTime.getHours() === now.getHours() && 
                            minute < now.getMinutes();
                          
                          return (
                            <option key={minute} value={minute} disabled={isDisabled} style={isDisabled ? { opacity: 0.4 } : {}}>
                              {String(minute).padStart(2, '0')}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Display selected time */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Thời gian đã chọn:
                  </p>
                  <p className="text-base font-bold text-blue-700">
                    {formatDisplayTime(bookingTime)}
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">⚠️ Lưu ý:</span> Vui lòng
                    chọn thời gian trong tương lai. Lịch đặt sẽ
                    tự động hủy nếu bạn không đến sau 1 giờ.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FaBatteryFull className="text-indigo-600 text-xl" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Gói thanh toán
                  </h2>
                </div>
                <button
                  onClick={() => router.push('/billing-plan')}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Chọn gói
                </button>
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

export default withCustomerAuth(BookingPage);
