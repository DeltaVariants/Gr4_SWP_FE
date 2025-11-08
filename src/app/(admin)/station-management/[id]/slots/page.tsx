"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { fetchSlotsByStation } from "@/application/services/slotService";
import { fetchAllStations } from "@/application/services/stationService";
import { fetchBatteriesByStation } from "@/application/services/stationBatteryService";
import {
  assignBatteryToSlot,
  updateBatteryPercentage,
  removeBatteryFromSlot,
} from "@/application/services/batteryService";
import { Slot } from "@/domain/entities/Slot";
import { FaBatteryFull, FaBatteryEmpty, FaSyncAlt } from "react-icons/fa";
import { AssignBatteryModal } from "@/app/(admin)/components/slot/AssignBatteryModal";
import { SlotDetailModal } from "@/app/(admin)/components/slot/SlotDetailModal";
import { Toast } from "@/presentation/components/ui/Toast";

export default function StationSlotsPage() {
  const params = useParams();
  const stationId = params.id as string;
  const dispatch = useAppDispatch();
  const { slots, loading, error, pagination } = useAppSelector(
    (state) => state.slot
  );
  const { stations } = useAppSelector((state) => state.station);
  const { batteries, loading: batteriesLoading } = useAppSelector(
    (state) => state.stationBattery
  );

  const [page, setPage] = useState(1);
  const pageSize = 30; // Show up to 30 slots per page

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Detail modal state for occupied slots
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailSlot, setDetailSlot] = useState<Slot | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Fetch station info if not available
  useEffect(() => {
    if (stations.length === 0) {
      dispatch(fetchAllStations());
    }
  }, [dispatch, stations.length]);

  // Fetch slots
  useEffect(() => {
    if (stationId) {
      dispatch(
        fetchSlotsByStation({
          stationID: stationId,
          pageNumber: page,
          pageSize: pageSize,
        })
      );
    }
  }, [dispatch, stationId, page]);

  // Fetch batteries for the station
  useEffect(() => {
    if (stationId) {
      dispatch(fetchBatteriesByStation(stationId));
    }
  }, [dispatch, stationId]);

  // Find current station
  const station = useMemo(
    () => stations.find((s) => s.stationID === stationId),
    [stations, stationId]
  );

  // Handle manual refresh
  const handleRefresh = () => {
    if (stationId) {
      dispatch(
        fetchSlotsByStation({
          stationID: stationId,
          pageNumber: page,
          pageSize: pageSize,
        })
      );
      dispatch(fetchBatteriesByStation(stationId));
    }
  };

  // Handle slot click
  const handleSlotClick = (slot: Slot) => {
    // If slot is empty, open assign modal
    if (!slot.batteryID || slot.status.toLowerCase() === "empty") {
      setSelectedSlot(slot);
      setIsModalOpen(true);
    } else {
      // If slot has battery, open detail modal
      setDetailSlot(slot);
      setIsDetailModalOpen(true);
    }
  };

  // Handle assign battery
  const handleAssignBattery = async (
    batteryId: string,
    currentPercentage: number
  ) => {
    if (!selectedSlot) return;

    setIsAssigning(true);
    try {
      // Use assignBatteryToSlot with batterySlotID and currentPercentage
      await dispatch(
        assignBatteryToSlot({
          batteryID: batteryId,
          batterySlotID: selectedSlot.batterySlotID,
          currentPercentage: currentPercentage,
        })
      ).unwrap();

      showToast(
        `Battery ${batteryId} assigned to ${selectedSlot.batterySlotID} successfully!`,
        "success"
      );

      // Close modal and refresh data
      setIsModalOpen(false);
      setSelectedSlot(null);
      handleRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to assign battery";
      showToast(message, "error");
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle update battery percentage from detail modal
  const handleUpdatePercentage = async (
    batteryId: string,
    percentage: number
  ) => {
    setIsUpdating(true);
    try {
      await dispatch(
        updateBatteryPercentage({
          batteryID: batteryId,
          currentPercentage: percentage,
        })
      ).unwrap();

      showToast(
        `Battery ${batteryId} percentage updated to ${percentage}% successfully!`,
        "success"
      );

      // Close modal and refresh data
      setIsDetailModalOpen(false);
      setDetailSlot(null);
      handleRefresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update battery percentage";
      showToast(message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle remove battery from slot
  const handleRemoveBattery = async (batteryId: string) => {
    setIsUpdating(true);
    try {
      await dispatch(removeBatteryFromSlot(batteryId)).unwrap();

      showToast(
        `Battery ${batteryId} removed from slot successfully!`,
        "success"
      );

      // Close modal and refresh data
      setIsDetailModalOpen(false);
      setDetailSlot(null);
      handleRefresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove battery from slot";
      showToast(message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get slot status color and icon
  const getSlotStatus = (slot: Slot) => {
    const status = slot.status.toLowerCase();
    if (status === "empty" || !slot.batteryID) {
      return {
        color: "bg-gray-100 border-gray-300 text-gray-600",
        icon: <FaBatteryEmpty className="text-2xl text-gray-400" />,
        label: "Empty",
      };
    }
    // Occupied - color based on battery percentage
    const percentage = slot.currentPercentage || 0;
    let color = "bg-green-100 border-green-500 text-green-800";
    let iconColor = "text-green-600";

    if (percentage < 30) {
      color = "bg-red-100 border-red-500 text-red-800";
      iconColor = "text-red-600";
    } else if (percentage < 70) {
      color = "bg-yellow-100 border-yellow-500 text-yellow-800";
      iconColor = "text-yellow-600";
    }

    return {
      color,
      icon: <FaBatteryFull className={`text-2xl ${iconColor}`} />,
      label: slot.status,
      percentage,
    };
  };

  // Extract slot number from batterySlotID
  const getSlotNumber = (batterySlotID: string) => {
    const match = batterySlotID.match(/Slot_(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  // Sort slots by slot number
  const sortedSlots = useMemo(() => {
    return [...slots].sort(
      (a, b) => getSlotNumber(a.batterySlotID) - getSlotNumber(b.batterySlotID)
    );
  }, [slots]);

  // Enrich slots with battery percentage from batteries list
  const enrichedSlots = useMemo(() => {
    return sortedSlots.map((slot) => {
      if (slot.batteryID) {
        // Find corresponding battery in batteries list
        const battery = batteries.find((b) => b.batteryID === slot.batteryID);
        if (battery) {
          return {
            ...slot,
            currentPercentage: battery.currentPercentage,
          };
        }
      }
      return slot;
    });
  }, [sortedSlots, batteries]);

  if (loading && slots.length === 0) {
    return (
      <div className="h-full flex flex-col">
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
            <span className="text-gray-600">Station Details</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading slots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
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
            <span className="text-gray-600">Station Details</span>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  const pages = pagination ? pagination.totalPages : 1;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/station-management"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Station Management
          </Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-600">
            {station?.stationName || "Station Details"}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Battery Slots
            </h2>
            {station && (
              <p className="text-gray-600 mt-1">{station.stationName}</p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="mb-4 bg-white rounded-lg shadow-sm p-4 shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-6">
              <div>
                <span className="text-gray-600">Total Slots: </span>
                <span className="font-semibold text-gray-900">
                  {pagination.totalItems}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Empty: </span>
                <span className="font-semibold text-gray-700">
                  {slots.filter((s) => !s.batteryID).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Occupied: </span>
                <span className="font-semibold text-green-700">
                  {slots.filter((s) => s.batteryID).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {sortedSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No slots found for this station</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {enrichedSlots.map((slot) => {
                const slotStatus = getSlotStatus(slot);
                const slotNumber = getSlotNumber(slot.batterySlotID);
                const isEmpty =
                  !slot.batteryID || slot.status.toLowerCase() === "empty";

                return (
                  <div
                    key={slot.batterySlotID}
                    onClick={() => handleSlotClick(slot)}
                    className={`${slotStatus.color} border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md aspect-square cursor-pointer hover:scale-105`}
                  >
                    {slotStatus.icon}
                    <div className="text-center">
                      <p className="font-bold text-lg">Slot {slotNumber}</p>
                      <p className="text-xs font-medium">{slotStatus.label}</p>
                      {slot.batteryID && (
                        <>
                          <p className="text-xs mt-1 truncate max-w-full px-1">
                            {slot.batteryID}
                          </p>
                          {slotStatus.percentage !== undefined && (
                            <p className="text-xs mt-1 font-bold">
                              {slotStatus.percentage}%
                            </p>
                          )}
                          <p className="text-xs mt-1 text-indigo-600 font-semibold">
                            Click to manage
                          </p>
                        </>
                      )}
                      {isEmpty && (
                        <p className="text-xs mt-1 text-indigo-600 font-semibold">
                          Click to assign
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="bg-gray-200 rounded-lg p-1 inline-flex items-center gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                    page === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  &lt;
                </button>

                {Array.from({ length: pages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md transition-all font-medium ${
                        page === pageNum
                          ? "bg-indigo-700 text-white shadow-xl"
                          : "text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
                    page === pages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Battery Modal */}
      {selectedSlot && (
        <AssignBatteryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSlot(null);
          }}
          slotNumber={getSlotNumber(selectedSlot.batterySlotID)}
          batteries={batteries}
          loading={batteriesLoading || isAssigning}
          onAssign={handleAssignBattery}
        />
      )}

      {/* Slot Detail Modal (for occupied slots) */}
      {detailSlot && (
        <SlotDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailSlot(null);
          }}
          slot={detailSlot}
          onUpdatePercentage={handleUpdatePercentage}
          onRemoveBattery={handleRemoveBattery}
          loading={isUpdating}
        />
      )}

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
