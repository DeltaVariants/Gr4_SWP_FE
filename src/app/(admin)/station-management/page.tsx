"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaPlus,
  FaMap,
  FaExchangeAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { fetchAllStations } from "@/application/services/stationService";
import { Station } from "@/domain/entities/Station";
import { Table, Column } from "@/presentation/components/ui/Table";
import { Select, SelectOption } from "@/presentation/components/ui/Select";
import { Input } from "@/presentation/components/ui/Input";

type BatteryFilterOption = "all" | "low" | "medium" | "high";

export default function StationManagement() {
  const dispatch = useAppDispatch();
  const { stations, loading, error } = useAppSelector((state) => state.station);

  const [searchTerm, setSearchTerm] = useState("");
  const [batteryFilter, setBatteryFilter] =
    useState<BatteryFilterOption>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);

  useEffect(() => {
    dispatch(fetchAllStations());
  }, [dispatch]);

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

  // Check if station can be deleted
  const canDeleteStation = (station: Station) => {
    return station.batteryOutSlots + station.batteryInSlots === 0;
  };

  const handleDeleteClick = (station: Station) => {
    if (canDeleteStation(station)) {
      setStationToDelete(station);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (stationToDelete) {
      // TODO: Implement delete API call
      console.log("Deleting station:", stationToDelete.stationID);
      setShowDeleteModal(false);
      setStationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setStationToDelete(null);
  };

  // Battery filter options
  const batteryFilterOptions: SelectOption[] = [
    { value: "all", label: "All Batteries" },
    { value: "low", label: "Low (< 30%)" },
    { value: "medium", label: "Medium (30-70%)" },
    { value: "high", label: "High (> 70%)" },
  ];

  // Define table columns
  const columns: Column<Station>[] = [
    {
      key: "stationName",
      header: "Station Name",
      render: (station) => (
        <div className="whitespace-nowrap">
          <div className="font-medium text-gray-900">{station.stationName}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (station) => (
        <div className="text-sm text-gray-600">{station.stationLocation}</div>
      ),
    },
    {
      key: "batteries",
      header: "Batteries",
      render: (station) => {
        const batteryPercentage =
          (station.batteryInSlots / station.slotNumber) * 100;
        return (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="text-sm text-gray-900 font-medium">
              {station.batteryInSlots}/{station.slotNumber}
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  batteryPercentage < 30
                    ? "bg-red-500"
                    : batteryPercentage < 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${batteryPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(batteryPercentage)}%
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (station) => {
        const canDelete = canDeleteStation(station);
        return (
          <div className="flex gap-3 whitespace-nowrap text-sm">
            <Link
              href={`/station-management/${station.stationID}`}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <FaEye />
            </Link>
            <Link
              href={`/station-management/${station.stationID}/edit`}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <FaEdit />
            </Link>
            <button
              onClick={() => handleDeleteClick(station)}
              disabled={!canDelete}
              className={`flex items-center gap-1 transition-colors ${
                canDelete
                  ? "text-red-600 hover:text-red-800 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              title={
                !canDelete
                  ? "Cannot delete station with batteries"
                  : "Delete station"
              }
            >
              <FaTrash />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* Filter Bar with Action Buttons */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
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

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredStations.length} of {stations.length} stations
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading stations...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Stations Table */}
      {!loading && !error && (
        <Table
          columns={columns}
          data={filteredStations}
          keyExtractor={(station) => station.stationID}
          emptyMessage="No stations found matching your criteria"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && stationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg text-gray-900 font-semibold mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete station{" "}
              <strong>{stationToDelete.stationName}</strong>? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
