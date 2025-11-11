"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector, useAppDispatch } from "@/application/hooks/useRedux";
import { fetchAllVehicles } from "@/application/services/vehicleService";
import { getBatteryType } from "@/utils/batteryUtils";
import { FiCheck } from "react-icons/fi";

// Plan types and data structures
interface PlanDetail {
  type: string;
  description: string;
  price: string;
  swapLimit?: string;
  savings?: string;
}

interface VehicleTypePlans {
  vehicleType: string;
  capacity: string;
  plans: PlanDetail[];
}

// Plan data from SubPlan.md
const planData: VehicleTypePlans[] = [
  {
    vehicleType: "Xe máy điện",
    capacity: "2 kWh",
    plans: [
      {
        type: "Theo Lần (Pay-per-swap)",
        description: "Trả tiền mỗi lần đổi pin, phù hợp với khách dùng ít",
        price: "40.000 ₫/lần",
      },
      {
        type: "Theo Ngày (Daily Rental)",
        description: "Thuê pin ngắn hạn, đổi pin không giới hạn trong 24h",
        price: "60.000 ₫/ngày",
        swapLimit: "Không giới hạn",
      },
      {
        type: "Theo Tháng - Cơ bản",
        description: "Gói phí cố định hàng tháng",
        price: "350.000 ₫/tháng",
        swapLimit: "≤10 lần/tháng",
      },
      {
        type: "Theo Tháng - Tiêu chuẩn",
        description: "Gói phí cố định hàng tháng",
        price: "500.000 ₫/tháng",
        swapLimit: "≤20 lần/tháng",
      },
      {
        type: "Theo Tháng - Premium",
        description: "Gói phí cố định hàng tháng",
        price: "800.000 ₫/tháng",
        swapLimit: "Không giới hạn",
      },
      {
        type: "Theo Năm - Cơ bản",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "3.300.000 ₫/năm",
        swapLimit: "≤120 lần/năm",
        savings: "Tiết kiệm 20%",
      },
      {
        type: "Theo Năm - Tiêu chuẩn",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "4.800.000 ₫/năm",
        swapLimit: "≤240 lần/năm",
        savings: "Tiết kiệm 20%",
      },
      {
        type: "Theo Năm - Premium",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "7.500.000 ₫/năm",
        swapLimit: "Không giới hạn",
        savings: "Tiết kiệm 25%",
      },
    ],
  },
  {
    vehicleType: "Ô tô điện cỡ nhỏ",
    capacity: "40 kWh",
    plans: [
      {
        type: "Theo Lần (Pay-per-swap)",
        description: "Trả tiền mỗi lần đổi pin, phù hợp với khách dùng ít",
        price: "200.000 ₫/lần",
      },
      {
        type: "Theo Ngày (Daily Rental)",
        description: "Thuê pin ngắn hạn, đổi pin không giới hạn trong 24h",
        price: "400.000 ₫/ngày",
        swapLimit: "Không giới hạn",
      },
      {
        type: "Theo Tháng - Cơ bản",
        description: "Gói phí cố định hàng tháng",
        price: "2.000.000 ₫/tháng",
        swapLimit: "≤10 lần/tháng",
      },
      {
        type: "Theo Tháng - Tiêu chuẩn",
        description: "Gói phí cố định hàng tháng",
        price: "3.000.000 ₫/tháng",
        swapLimit: "≤20 lần/tháng",
      },
      {
        type: "Theo Tháng - Premium",
        description: "Gói phí cố định hàng tháng",
        price: "5.000.000 ₫/tháng",
        swapLimit: "Không giới hạn",
      },
      {
        type: "Theo Năm - Cơ bản",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "20.000.000 ₫/năm",
        swapLimit: "≤120 lần/năm",
        savings: "Tiết kiệm 20%",
      },
      {
        type: "Theo Năm - Tiêu chuẩn",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "30.000.000 ₫/năm",
        swapLimit: "≤240 lần/năm",
        savings: "Tiết kiệm 20%",
      },
      {
        type: "Theo Năm - Premium",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "50.000.000 ₫/năm",
        swapLimit: "Không giới hạn",
        savings: "Tiết kiệm 25%",
      },
    ],
  },
  {
    vehicleType: "Ô tô điện SUV/cỡ lớn",
    capacity: "80 kWh",
    plans: [
      {
        type: "Theo Lần (Pay-per-swap)",
        description: "Trả tiền mỗi lần đổi pin, phù hợp với khách dùng ít",
        price: "400.000 ₫/lần",
      },
      {
        type: "Theo Ngày (Daily Rental)",
        description: "Thuê pin ngắn hạn, đổi pin không giới hạn trong 24h",
        price: "700.000 ₫/ngày",
        swapLimit: "Không giới hạn",
      },
      {
        type: "Theo Tháng - Cơ bản",
        description: "Gói phí cố định hàng tháng",
        price: "3.500.000 ₫/tháng",
        swapLimit: "≤10 lần/tháng",
      },
      {
        type: "Theo Tháng - Tiêu chuẩn",
        description: "Gói phí cố định hàng tháng",
        price: "5.000.000 ₫/tháng",
        swapLimit: "≤20 lần/tháng",
      },
      {
        type: "Theo Tháng - Premium",
        description: "Gói phí cố định hàng tháng",
        price: "8.000.000 ₫/tháng",
        swapLimit: "Không giới hạn",
      },
      {
        type: "Theo Năm - Cơ bản",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "35.000.000 ₫/năm",
        swapLimit: "≤120 lần/năm",
        savings: "Tiết kiệm 20%",
      },
      {
        type: "Theo Năm - Tiêu chuẩn",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "50.000.000 ₫/năm",
        swapLimit: "≤240 lần/năm",
        savings: "Tiết kiệm 20%",
      },
      {
        type: "Theo Năm - Premium",
        description: "Thanh toán theo năm, tiết kiệm 20-25%",
        price: "80.000.000 ₫/năm",
        swapLimit: "Không giới hạn",
        savings: "Tiết kiệm 25%",
      },
    ],
  },
];

// Map battery type to vehicle type
const batteryTypeToVehicleType: Record<string, string> = {
  Small: "Xe máy điện",
  Medium: "Ô tô điện cỡ nhỏ",
  Large: "Ô tô điện SUV/cỡ lớn",
};

export default function BillingPlanPage() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();

  // Get vehicle data from Redux store
  const {
    selectedVehicle,
    vehicles,
    loading: vehicleLoading,
  } = useAppSelector((state) => state.vehicle);

  const [loading, setLoading] = useState(true);
  const [selectedPlanType, setSelectedPlanType] =
    useState<VehicleTypePlans | null>(null);

  // Fetch vehicles from Redux if not already loaded
  useEffect(() => {
    if (isAuthenticated && user && vehicles.length === 0 && !vehicleLoading) {
      dispatch(fetchAllVehicles());
    }
  }, [isAuthenticated, user, vehicles.length, vehicleLoading, dispatch]);

  // Determine plan type based on vehicle's battery type
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setSelectedPlanType(planData[0]); // Default to motorcycle
      return;
    }

    // Wait for vehicles to be loaded
    if (vehicleLoading) {
      return;
    }

    // Use selectedVehicle from Redux or first vehicle if available
    const vehicle = selectedVehicle || vehicles[0];

    if (vehicle) {
      // Determine vehicle type from battery type
      // Use batteryTypeModel first, fallback to batteryTypeID
      const batteryType = getBatteryType(vehicle.batteryTypeModel);
      const vehicleType = batteryTypeToVehicleType[batteryType] || "Xe điện";

      console.log(
        "Battery Type:",
        batteryType,
        "-> Vehicle Type:",
        vehicleType
      );
      console.log("Vehicle from Redux:", vehicle);

      // Find matching plan data
      const matchedPlan = planData.find((p) => p.vehicleType === vehicleType);
      setSelectedPlanType(matchedPlan || planData[0]);
    } else {
      // Default to motorcycle if no vehicle
      setSelectedPlanType(planData[0]);
    }

    setLoading(false);
  }, [isAuthenticated, user, selectedVehicle, vehicles, vehicleLoading]);

  const handleSelectPlan = (plan: PlanDetail) => {
    // TODO: Implement plan selection/purchase logic
    console.log("Selected plan:", plan);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!selectedPlanType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy gói cước phù hợp</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gói Thuê Pin Điện
            </h1>
            <p className="text-base text-gray-600">
              Chọn gói phù hợp với nhu cầu của bạn
            </p>
          </div>

          {/* Horizontal Scrollable Plan Cards */}
          <div className="mb-8">
            <div
              className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#6366f1 #e5e7eb",
              }}
              onMouseDown={(e) => {
                const slider = e.currentTarget;
                let isDown = true;
                const startX = e.pageX - slider.offsetLeft;
                const scrollLeft = slider.scrollLeft;

                const handleMouseMove = (e: MouseEvent) => {
                  if (!isDown) return;
                  e.preventDefault();
                  const x = e.pageX - slider.offsetLeft;
                  const walk = (x - startX) * 2;
                  slider.scrollLeft = scrollLeft - walk;
                };

                const handleMouseUp = () => {
                  isDown = false;
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              }}
            >
              {selectedPlanType.plans.map((plan, index) => (
                <div
                  key={index}
                  className="shrink-0 w-80 snap-start bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {/* Header */}
                  <div className="bg-linear-to-r from-indigo-600 to-indigo-800 px-6 py-4">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {plan.type}
                    </h3>
                    <p className="text-xs text-indigo-100 line-clamp-2 h-8">
                      {plan.description}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Price */}
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold text-gray-900">
                        {plan.price.split("/")[0]}
                      </p>
                      <p className="text-sm text-gray-600">
                        /{plan.price.split("/")[1]}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4 flex-1">
                      {plan.swapLimit && (
                        <div className="flex items-start text-sm">
                          <FiCheck className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Số lần đổi pin
                            </p>
                            <p className="text-gray-600 text-xs">
                              {plan.swapLimit}
                            </p>
                          </div>
                        </div>
                      )}
                      {plan.savings && (
                        <div className="flex items-start text-sm">
                          <FiCheck className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <p className="text-green-600 font-semibold">
                            {plan.savings}
                          </p>
                        </div>
                      )}
                      <div className="flex items-start text-sm">
                        <FiCheck className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <p className="text-gray-600">
                          Pin {selectedPlanType.capacity}
                        </p>
                      </div>
                      <div className="flex items-start text-sm">
                        <FiCheck className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <p className="text-gray-600">Hỗ trợ 24/7</p>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan);
                      }}
                      className="w-full bg-linear-to-r from-indigo-600 to-indigo-800 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all group-hover:scale-105 text-sm"
                    >
                      Chọn Gói Này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
