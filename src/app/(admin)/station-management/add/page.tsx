"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Station } from "@/domain/dto/Hoang/Station";
import { AdminInput } from "../../components/AdminInput";
import { Modal } from "@/presentation/components/ui/Modal";
import { stationRepositoryAPI } from "@/infrastructure/repositories/Hoang/StationRepositoryAPI.impl";
import { CreateStationRequest } from "@/domain/repositories/Hoang/StationRepository";
import { createStationUseCase } from "@/application/usecases/station/CreateStation.usecase";
import { useAppDispatch } from "@/application/hooks/useRedux";
import { fetchAllStations } from "@/application/services/Hoang/stationService";

export default function AddStation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStation, setCreatedStation] = useState<Station | null>(null);

  const [formData, setFormData] = useState<CreateStationRequest>({
    stationName: "",
    stationLocation: "",
    latitude: 0,
    longitude: 0,
    slotNumber: 1,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateStationRequest, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateStationRequest, string>> = {};

    if (!formData.stationName.trim()) {
      newErrors.stationName = "Station name is required";
    } else if (formData.stationName.length < 3) {
      newErrors.stationName = "Station name must be at least 3 characters";
    }

    if (!formData.stationLocation.trim()) {
      newErrors.stationLocation = "Station location is required";
    } else if (formData.stationLocation.length < 10) {
      newErrors.stationLocation = "Please enter a complete address";
    }

    if (formData.latitude === 0) {
      newErrors.latitude = "Latitude is required";
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90";
    }

    if (formData.longitude === 0) {
      newErrors.longitude = "Longitude is required";
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180";
    }

    if (formData.slotNumber < 1) {
      newErrors.slotNumber = "Slot number must be at least 1";
    } else if (formData.slotNumber > 100) {
      newErrors.slotNumber = "Slot number cannot exceed 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof CreateStationRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Gọi usecase để tạo trạm mới (theo Clean Architecture)
      const newStation = await createStationUseCase(
        stationRepositoryAPI,
        formData
      );

      console.log("Station created successfully:", newStation);

      // Invalidate cache và refresh danh sách stations
      dispatch(fetchAllStations());

      setCreatedStation(newStation);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to create station:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create station. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setCreatedStation(null);
    // Reset form về trạng thái ban đầu
    setFormData({
      stationName: "",
      stationLocation: "",
      latitude: 0,
      longitude: 0,
      slotNumber: 1,
    });
    setErrors({});
  };

  const handleBackToList = () => {
    router.push("/station-management");
  };

  return (
    <div className="max-h-screen overflow-y-auto">
      <div className="mb-4">
        <Link
          href="/station-management"
          className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
        >
          ← Back to Stations
        </Link>
        <h2 className="text-2xl font-semibold">Add New Station</h2>
        <p className="text-gray-600 text-sm">
          Create a new battery swap station
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminInput
              label="Station Name"
              value={formData.stationName}
              onChange={(value) => handleInputChange("stationName", value)}
              placeholder="Enter station name"
              error={errors.stationName}
              required
              disabled={isSubmitting}
              className="md:col-span-2"
            />

            <AdminInput
              label="Total Slots"
              type="number"
              value={formData.slotNumber}
              onChange={(value) =>
                handleInputChange("slotNumber", parseInt(value) || 0)
              }
              placeholder="Enter slots"
              error={errors.slotNumber}
              required
              disabled={isSubmitting}
              min="1"
              max="100"
            />

            <AdminInput
              label="Address"
              value={formData.stationLocation}
              onChange={(value) => handleInputChange("stationLocation", value)}
              placeholder="Enter station address"
              error={errors.stationLocation}
              required
              disabled={isSubmitting}
              className="md:col-span-3"
            />

            <AdminInput
              label="Latitude"
              type="number"
              value={formData.latitude || ""}
              onChange={(value) =>
                handleInputChange("latitude", parseFloat(value) || 0)
              }
              placeholder="e.g., 21.0285"
              error={errors.latitude}
              required
              disabled={isSubmitting}
              step="any"
              hideSpinner
            />

            <AdminInput
              label="Longitude"
              type="number"
              value={formData.longitude || ""}
              onChange={(value) =>
                handleInputChange("longitude", parseFloat(value) || 0)
              }
              placeholder="e.g., 105.8542"
              error={errors.longitude}
              required
              disabled={isSubmitting}
              step="any"
              hideSpinner
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/station-management"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-600 disabled:opacity-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Adding..." : "Add Station"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Station Added Successfully!"
        overlayType="blur"
      >
        <div className="space-y-4">
          {createdStation && (
            <div className="space-y-2">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Station Name</p>
                  <p className="font-semibold text-gray-900">
                    {createdStation.stationName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">
                    {createdStation.stationLocation}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Latitude</p>
                    <p className="font-semibold text-gray-900">
                      {createdStation.latitude}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longitude</p>
                    <p className="font-semibold text-gray-900">
                      {createdStation.longitude}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Slots</p>
                  <p className="font-semibold text-gray-900">
                    {createdStation.slotNumber}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleModalClose}
              className="flex-1 px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              Add Another
            </button>
            <button
              onClick={handleBackToList}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Back to List
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
