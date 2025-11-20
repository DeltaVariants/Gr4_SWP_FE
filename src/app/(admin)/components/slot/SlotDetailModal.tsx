"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/presentation/components/ui/Modal";
import { Slot } from "@/domain/entities/Slot";
import { FaBatteryFull, FaTrash } from "react-icons/fa";

interface SlotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: Slot;
  onUpdatePercentage: (batteryId: string, percentage: number) => void;
  onRemoveBattery: (batteryId: string) => void;
  loading: boolean;
}

export const SlotDetailModal = ({
  isOpen,
  onClose,
  slot,
  onUpdatePercentage,
  onRemoveBattery,
  loading,
}: SlotDetailModalProps) => {
  const [percentage, setPercentage] = useState<number>(
    slot.currentPercentage || 0
  );
  const [isRemoving, setIsRemoving] = useState(false);

  // Update percentage when slot changes
  useEffect(() => {
    setPercentage(slot.currentPercentage || 0);
    setIsRemoving(false);
  }, [slot]);

  const handleUpdatePercentage = () => {
    if (slot.batteryID) {
      onUpdatePercentage(slot.batteryID, percentage);
    }
  };

  const handleRemoveBattery = () => {
    if (slot.batteryID) {
      setIsRemoving(true);
      onRemoveBattery(slot.batteryID);
    }
  };

  // Extract slot number
  const getSlotNumber = (batterySlotID: string) => {
    const match = batterySlotID.match(/Slot_(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  const slotNumber = getSlotNumber(slot.batterySlotID);

  // Get battery percentage color
  const getPercentageColor = (pct: number) => {
    if (pct < 30) return "text-red-600";
    if (pct < 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Slot ${slotNumber} Details`}
    >
      <div className="space-y-2">
        {/* Battery Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start gap-4">
            <FaBatteryFull
              className={`text-3xl ${getPercentageColor(percentage)}`}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Battery ID</p>
              <p className="font-semibold text-gray-900 break-all">
                {slot.batteryID || "N/A"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Current Charge:</span>
                <span
                  className={`font-bold text-lg ${getPercentageColor(
                    slot.currentPercentage || 0
                  )}`}
                >
                  {slot.currentPercentage || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Percentage Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Update Battery Charge</h3>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">New Percentage:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) =>
                  setPercentage(
                    Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
                className={`w-20 px-3 py-1 text-center font-bold text-lg border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${getPercentageColor(
                  percentage
                )} bg-white border-gray-300 hover:border-indigo-400`}
                disabled={loading}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <button
            onClick={handleUpdatePercentage}
            disabled={
              loading ||
              !slot.batteryID ||
              percentage === (slot.currentPercentage || 0)
            }
            className={`w-full px-4 py-2 rounded-lg text-white transition-colors ${
              loading ||
              !slot.batteryID ||
              percentage === (slot.currentPercentage || 0)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Updating..." : "Update Percentage"}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Remove Battery Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Remove Battery</h3>
          <p className="text-sm text-gray-600">
            Remove the battery from this slot. The battery will be returned to
            idle status.
          </p>
          <button
            onClick={handleRemoveBattery}
            disabled={loading || isRemoving || !slot.batteryID}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
              loading || isRemoving || !slot.batteryID
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-400 hover:bg-red-700"
            }`}
          >
            <FaTrash />
            {loading || isRemoving ? "Removing..." : "Remove Battery from Slot"}
          </button>
        </div>

        {/* Close Button */}
        <div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading || isRemoving}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
