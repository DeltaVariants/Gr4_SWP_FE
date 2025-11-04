"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaMap,
  FaExchangeAlt,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { fetchAllStations } from "@/application/services/stationService";
import { Station } from "@/domain/entities/Station";
import { Select, SelectOption } from "@/presentation/components/ui/Select";
import { Input } from "@/presentation/components/ui/Input";
import { Actions, ActionItem } from "@/presentation/components/ui/Actions";
import { stationRepositoryAPI } from "@/infrastructure/repositories/StationRepositoryAPI.impl";
import { deleteStationUseCase } from "@/application/usecases/station/DeleteStation.usecase";
import { Modal } from "@/presentation/components/ui/Modal";

type BatteryFilterOption = "all" | "low" | "medium" | "high";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export default function StationManagement() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { stations, loading, error, lastFetched } = useAppSelector(
    (state) => state.station
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [batteryFilter, setBatteryFilter] =
    useState<BatteryFilterOption>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate rows per page based on container height
  useEffect(() => {
    const updateRowsPerPage = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // More accurate calculation:
        // Header height: ~48px, Row height: ~65px, Pagination: ~60px, Bottom padding: ~20px
        const headerHeight = 48;
        const paginationHeight = 60;
        const padding = 20;
        const rowHeight = 65;

        const availableHeight =
          containerHeight - headerHeight - paginationHeight - padding;
        const calculatedRows = Math.floor(availableHeight / rowHeight);
        // Minimum 7 rows, maximum 12 rows
        const newRowsPerPage = Math.max(7, Math.min(12, calculatedRows));
        setRowsPerPage(newRowsPerPage);
      }
    };

    // Delay calculation to ensure container is rendered
    const timer = setTimeout(updateRowsPerPage, 100);

    window.addEventListener("resize", updateRowsPerPage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRowsPerPage);
    };
  }, []);

  useEffect(() => {
    // Only fetch if no data exists or cache is stale
    const now = Date.now();
    const isCacheValid = lastFetched && now - lastFetched < CACHE_DURATION;

    if (!isCacheValid || stations.length === 0) {
      dispatch(fetchAllStations());
    }
  }, [dispatch, lastFetched, stations.length]);

  // Handle row click to navigate to station detail
  const handleRowClick = useCallback(
    (stationID: string) => {
      router.push(`/station-management/${stationID}`);
    },
    [router]
  );

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    dispatch(fetchAllStations());
  }, [dispatch]);

  // Check if using cached data
  const isCacheValid = useMemo(() => {
    if (!lastFetched) return false;
    const now = Date.now();
    return now - lastFetched < CACHE_DURATION;
  }, [lastFetched]);

  // Get time since last fetch
  const timeSinceLastFetch = useMemo(() => {
    if (!lastFetched) return null;
    const seconds = Math.floor((Date.now() - lastFetched) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }, [lastFetched]);

  // Filter and search logic
  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // Search by name
      const matchesSearch = station.stationName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by battery availability
      const batteryPercentage =
        (station.batteryInSlots / station.slotNumber) * 100;
      let matchesBatteryFilter = true;

      if (batteryFilter === "low") {
        matchesBatteryFilter = batteryPercentage < 30;
      } else if (batteryFilter === "medium") {
        matchesBatteryFilter =
          batteryPercentage >= 30 && batteryPercentage < 70;
      } else if (batteryFilter === "high") {
        matchesBatteryFilter = batteryPercentage >= 70;
      }

      return matchesSearch && matchesBatteryFilter;
    });
  }, [stations, searchTerm, batteryFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, batteryFilter]);

  // Check if station can be deleted
  const canDeleteStation = (station: Station) => {
    return station.batteryOutSlots + station.batteryInSlots === 0;
  };

  const handleDeleteClick = useCallback((station: Station) => {
    if (canDeleteStation(station)) {
      setStationToDelete(station);
      setDeleteError("");
      setShowDeleteModal(true);
    }
  }, []);

  const handleDeleteConfirm = async () => {
    if (!stationToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      // Gọi usecase để xóa trạm (sử dụng tên trạm theo yêu cầu API)
      await deleteStationUseCase(
        stationRepositoryAPI,
        stationToDelete.stationName
      );

      console.log("Station deleted successfully:", stationToDelete.stationName);

      // Refresh danh sách stations sau khi xóa thành công
      dispatch(fetchAllStations());

      // Đóng modal
      setShowDeleteModal(false);
      setStationToDelete(null);
    } catch (err) {
      console.error("Failed to delete station:", err);
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Failed to delete station. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStationToDelete(null);
    setDeleteError("");
  };

  // Battery filter options
  const batteryFilterOptions: SelectOption[] = [
    { value: "all", label: "All Batteries" },
    { value: "low", label: "Low (< 30%)" },
    { value: "medium", label: "Medium (30-70%)" },
    { value: "high", label: "High (> 70%)" },
  ];

  // Pagination logic
  const pages = Math.ceil(filteredStations.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredStations.slice(start, end);
  }, [page, filteredStations, rowsPerPage]);

  // Render cell content
  const renderCell = useCallback(
    (station: Station, columnKey: React.Key) => {
      const batteryPercentage =
        (station.batteryInSlots / station.slotNumber) * 100;

      switch (columnKey) {
        case "stationName":
          return (
            <div className="flex flex-col">
              <p className="font-medium text-gray-900">{station.stationName}</p>
            </div>
          );
        case "location":
          return (
            <p className="text-sm text-gray-600">{station.stationLocation}</p>
          );
        case "batteries":
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {station.batteryInSlots}/{station.slotNumber}
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    batteryPercentage < 30
                      ? "bg-red-500"
                      : batteryPercentage < 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(batteryPercentage, 100)}%` }}
                />
              </div>
              <Chip
                size="sm"
                variant="flat"
                color={
                  batteryPercentage < 30
                    ? "danger"
                    : batteryPercentage < 70
                    ? "warning"
                    : "success"
                }
              >
                {Math.round(batteryPercentage)}%
              </Chip>
            </div>
          );
        case "actions":
          const canDelete = canDeleteStation(station);
          const actionItems: ActionItem[] = [
            {
              label: "View Details",
              onClick: () =>
                router.push(`/station-management/${station.stationID}`),
              tooltip: "View station details",
            },
            {
              label: "Edit Station",
              onClick: () =>
                router.push(`/station-management/${station.stationID}/edit`),
              tooltip: "Edit station information",
            },
            {
              label: "Delete Station",
              onClick: () => handleDeleteClick(station),
              disabled: !canDelete,
              tooltip: canDelete
                ? "Delete this station"
                : "Cannot delete station with batteries",
              color: "danger",
            },
          ];

          return <Actions items={actionItems} />;
        default:
          return null;
      }
    },
    [handleDeleteClick, router]
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Bar with Action Buttons */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4 shrink-0">
        <div className="flex gap-4 items-center mb-3">
          {/* Search by name */}
          <Input
            type="text"
            placeholder="Search by station name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FaSearch />}
            containerClassName="flex-1"
          />

          {/* Battery filter */}
          <Select
            options={batteryFilterOptions}
            value={batteryFilter}
            onChange={(e) =>
              setBatteryFilter(e.target.value as BatteryFilterOption)
            }
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              href="/station-management/monitor"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <FaMap /> Monitor
            </Link>
            <Link
              href="/station-management/battery-distribute"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <FaExchangeAlt /> Distribute
            </Link>
            <Link
              href="/station-management/add"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <FaPlus /> Add Station
            </Link>
          </div>
        </div>

        {/* Results count and refresh button */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredStations.length} of {stations.length} stations
            {isCacheValid && !loading && timeSinceLastFetch && (
              <span className="ml-2 text-green-600">
                • Cached ({timeSinceLastFetch})
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Refresh station list"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div ref={containerRef} className="flex-1 min-h-0 flex flex-col gap-4">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading stations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Stations Table */}
        {!loading && !error && (
          <div className="flex-1 min-h-0">
            <Table
              aria-label="Stations table with client side pagination"
              bottomContent={
                pages > 1 ? (
                  <div className="flex w-full justify-center ">
                    <div className="bg-gray-200 rounded-lg p-1 inline-flex items-center gap-1">
                      {/* Previous Button */}
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

                      {/* Page Numbers */}
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

                      {/* Next Button */}
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
                ) : null
              }
              classNames={{
                wrapper: "h-full bg-white rounded-lg shadow-md",
                th: "bg-gray-100 text-gray-900 font-semibold",
                td: "text-gray-900",
                tr: "hover:bg-gray-50 transition-colors",
              }}
            >
              <TableHeader>
                <TableColumn key="stationName">STATION NAME</TableColumn>
                <TableColumn key="location">LOCATION</TableColumn>
                <TableColumn key="batteries">BATTERIES</TableColumn>
                <TableColumn key="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={items}
                emptyContent="No stations found matching your criteria"
              >
                {(item) => (
                  <TableRow
                    key={item.stationID}
                    onClick={() => handleRowClick(item.stationID)}
                    className="cursor-pointer"
                  >
                    {(columnKey) => (
                      <TableCell>{renderCell(item, columnKey)}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        title="Confirm Delete"
        overlayType="blur"
      >
        {stationToDelete && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete station{" "}
              <strong className="text-gray-900">
                {stationToDelete.stationName}
              </strong>
              ? This action cannot be undone.
            </p>

            {/* Error message */}
            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
