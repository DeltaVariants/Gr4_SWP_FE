"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Toast } from "@/presentation/components/ui/Toast";

export default function EditStation() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.id;

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const [slotNumber, setSlotNumber] = useState(15);

  const handleSlotChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num > 30) {
      showToast("Slot number cannot exceed 30", "warning");
      return;
    }
    setSlotNumber(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    alert("Station updated successfully!");
    router.push(`/station-management/${stationId}`);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/station-management"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Station Management
          </Link>
          <span className="text-gray-400">&gt;</span>
          <Link
            href={`/station-management/${stationId}`}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Station Details
          </Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-600">Edit</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Edit Station</h2>
        <p className="text-gray-600">
          Editing Station ID: <span className="font-semibold">{stationId}</span>
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station Name *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter station name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter station address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Slots *
              </label>
              <input
                type="number"
                value={slotNumber}
                onChange={(e) => handleSlotChange(e.target.value)}
                className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter total slots"
                min="1"
                max="30"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 30 slots</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Hours
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 24/7 or 6:00 AM - 10:00 PM"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link
              href={`/station-management/${stationId}`}
              className="px-6 py-2 border text-gray-600 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  );
}
