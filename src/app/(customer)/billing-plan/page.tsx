"use client";

import { withCustomerAuth } from '@/hoc/withAuth';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSelector, useAppDispatch } from "@/application/hooks/useRedux";
import { fetchAllVehicles } from "@/application/services/vehicleService";
import { getBatteryTypeFromId } from "@/domain/entities/Battery";
import { FiCheck } from "react-icons/fi";

// Plan types from API
interface ApiPlan {
  planID: string;
  name: string;
  planGroup: string;
  tier: string;
  price: number;
  description: string;
  durationDays: number;
  maxSwapsPerPeriod: number | null;
}

// Plan types and data structures
interface PlanDetail {
  planID: string;
  type: string;
  description: string;
  price: string;
  swapLimit?: string;
  savings?: string;
  tier: string;
  planGroup: string;
}

interface VehicleTypePlans {
  vehicleType: string;
  capacity: string;
  plans: PlanDetail[];
}

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [apiPlans, setApiPlans] = useState<ApiPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Fetch subscription plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Get token from localStorage or cookies
        let token = localStorage.getItem("accessToken");
        
        // Fallback to cookies if localStorage is empty
        if (!token) {
          const cookies = document.cookie.split(';');
          const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
          if (tokenCookie) {
            token = tokenCookie.split('=')[1];
            // Restore to localStorage for future use
            localStorage.setItem("accessToken", token);
          }
        }
        
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await fetch("/api/subscription-plans", { headers });
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setApiPlans(result.data);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch vehicles from Redux if not already loaded
  useEffect(() => {
    if (isAuthenticated && user && vehicles.length === 0 && !vehicleLoading) {
      dispatch(fetchAllVehicles());
    }
  }, [isAuthenticated, user, vehicles.length, vehicleLoading, dispatch]);

  // Convert API plans to display format
  useEffect(() => {
    if (plansLoading || apiPlans.length === 0) {
      return;
    }

    // Group plans by vehicle type based on plan name
    const getVehicleType = (planName: string): string => {
      if (planName.includes("xe máy")) return "Xe máy điện";
      if (planName.includes("ô tô nhỏ")) return "Ô tô điện cỡ nhỏ";
      if (planName.includes("ô tô SUV") || planName.includes("ô tô điện suv")) return "Ô tô điện SUV/cỡ lớn";
      return "Xe điện";
    };

    // Convert API plan to PlanDetail
    const convertPlan = (apiPlan: ApiPlan): PlanDetail => {
      const swapLimit = apiPlan.maxSwapsPerPeriod 
        ? `≤${apiPlan.maxSwapsPerPeriod} lần`
        : "Không giới hạn";

      return {
        planID: apiPlan.planID,
        type: apiPlan.name,
        description: apiPlan.description,
        price: `${apiPlan.price.toLocaleString("vi-VN")} ₫`,
        swapLimit,
        tier: apiPlan.tier,
        planGroup: apiPlan.planGroup,
      };
    };

    // Determine vehicle type
    let targetVehicleType = "Xe máy điện"; // default
    let batteryType = "Small"; // default
    
    const vehicle = selectedVehicle || vehicles[0];
    if (vehicle) {
      batteryType = getBatteryTypeFromId(vehicle.batteryTypeID);
      console.log(`[BillingPlan] Vehicle: ${vehicle.vehicleName}, batteryTypeID: ${vehicle.batteryTypeID}, batteryType: ${batteryType}`);
      targetVehicleType = batteryTypeToVehicleType[batteryType] || "Xe máy điện";
    }

    // Filter and convert plans for this vehicle type
    const filteredPlans = apiPlans
      .filter(p => getVehicleType(p.name.toLowerCase()) === targetVehicleType)
      .map(convertPlan);
    
    console.log(`[BillingPlan] Filtered ${filteredPlans.length} plans for ${targetVehicleType} (Battery: ${batteryType})`);

    if (filteredPlans.length > 0) {
      setSelectedPlanType({
        vehicleType: targetVehicleType,
        capacity: "", // Not needed from API
        plans: filteredPlans,
      });
    } else {
      // Fallback: show all motorcycle plans if no match
      const motorPlans = apiPlans
        .filter(p => p.name.toLowerCase().includes("xe máy"))
        .map(convertPlan);
      
      setSelectedPlanType({
        vehicleType: "Xe máy điện",
        capacity: "2 kWh",
        plans: motorPlans,
      });
    }

    setLoading(false);
  }, [apiPlans, plansLoading, selectedVehicle, vehicles]);

  const handleSelectPlan = (plan: PlanDetail) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentError("");
  };

  const handlePayment = async () => {
    const vehicle = selectedVehicle || vehicles[0];
    if (!vehicle) {
      setPaymentError("Vui lòng chọn xe trước");
      return;
    }

    if (!selectedPlan) {
      setPaymentError("Vui lòng chọn gói");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setPaymentError("Vui lòng đăng nhập");
        return;
      }

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleID: vehicle.vehicleID,
          planID: selectedPlan.planID,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.data?.checkoutUrl) {
        // Redirect to PayOS payment page
        console.log('[Payment] Redirecting to:', result.data.checkoutUrl);
        window.location.href = result.data.checkoutUrl;
      } else {
        setPaymentError(result.message || "Thanh toán thất bại");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError("Lỗi kết nối. Vui lòng thử lại");
    } finally {
      setPaymentLoading(false);
    }
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
    <div className="w-full bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full">
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Xác nhận thanh toán
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Gói đã chọn</p>
                <p className="font-semibold text-gray-900">{selectedPlan.type}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedPlan.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Giá</p>
                <p className="text-2xl font-bold text-indigo-600">{selectedPlan.price}</p>
              </div>

              {selectedPlan.swapLimit && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Giới hạn đổi pin</p>
                  <p className="font-semibold text-gray-900">{selectedPlan.swapLimit}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Xe sử dụng</p>
                <p className="font-semibold text-gray-900">
                  {(selectedVehicle || vehicles[0])?.vehicleName || "Chưa chọn xe"}
                </p>
              </div>
            </div>

            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-sm text-red-700">{paymentError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentError("");
                }}
                disabled={paymentLoading}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center"
              >
                {paymentLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận thanh toán"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
