import { useState, useEffect } from "react";
import { Modal } from "@/presentation/components/ui/Modal";
import { StationBattery } from "@/domain/entities/StationBattery";
import { FaBatteryFull, FaSearch } from "react-icons/fa";
import { Input } from "@/presentation/components/ui/Input";

interface AssignBatteryModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotNumber: number;
  batteries: StationBattery[];
  loading: boolean;
  onAssign: (batteryId: string, currentPercentage: number) => void;
}

export const AssignBatteryModal = ({
  isOpen,
  onClose,
  slotNumber,
  batteries,
  loading,
  onAssign,
}: AssignBatteryModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBattery, setSelectedBattery] = useState<StationBattery | null>(
    null
  );
  const [customPercentage, setCustomPercentage] = useState<number>(100);

  // Filter batteries: idle location and available status
  const availableBatteries = batteries.filter(
    (battery) =>
      battery.currentLocation.toLowerCase() === "idle" &&
      battery.batteryStatus.toLowerCase() === "available"
  );

  // Search filter
  const filteredBatteries = availableBatteries.filter((battery) =>
    battery.batteryID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedBattery(null);
      setCustomPercentage(100);
    }
  }, [isOpen]);

  const handleSelectBattery = (battery: StationBattery) => {
    setSelectedBattery(battery);
    setCustomPercentage(battery.currentPercentage);
  };

  const handleAssign = () => {
    if (selectedBattery) {
      onAssign(selectedBattery.batteryID, customPercentage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Battery to Slot ${slotNumber}`}
    >
      <div className="space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search battery ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<FaSearch />}
        />

        {/* Battery List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading batteries...</p>
            </div>
          ) : filteredBatteries.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              {availableBatteries.length === 0
                ? "No available batteries found"
                : "No batteries match your search"}
            </div>
          ) : (
            filteredBatteries.map((battery) => (
              <div
                key={battery.batteryID}
                onClick={() => handleSelectBattery(battery)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedBattery?.batteryID === battery.batteryID
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaBatteryFull className="text-green-600 text-xl" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {battery.batteryID}
                      </p>
                      <p className="text-xs text-gray-600">
                        {battery.batteryTypeName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-600">Health:</div>
                      <div className="font-semibold text-green-700">
                        {battery.soH}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-gray-600">Charge:</div>
                      <div className="font-semibold text-blue-700">
                        {battery.currentPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Battery & Custom Percentage */}
        {selectedBattery && (
          <div className="border-t pt-4 space-y-3">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                Selected:{" "}
                <span className="font-semibold text-indigo-900">
                  {selectedBattery.batteryID}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Battery Charge Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={customPercentage}
                onChange={(e) =>
                  setCustomPercentage(
                    Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
                className="w-full px-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {selectedBattery.currentPercentage}%
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedBattery || loading}
            className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
              !selectedBattery || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Assigning..." : "Assign Battery"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
