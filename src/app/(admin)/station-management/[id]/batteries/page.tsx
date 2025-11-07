"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { fetchBatteriesByStation } from "@/application/services/stationBatteryService";
import { fetchAllStations } from "@/application/services/stationService";
import { StationBattery } from "@/domain/entities/StationBattery";
import { FaBatteryFull, FaSyncAlt, FaSearch } from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import { Input } from "@/presentation/components/ui/Input";
import { Select, SelectOption } from "@/presentation/components/ui/Select";
import { Breadcrumb } from "@/presentation/components/ui/Breadcrumb";

type StatusFilterOption = "all" | "available" | "faulty" | "charging";

export default function StationBatteriesPage() {
  const params = useParams();
  const stationId = params.id as string;
  const dispatch = useAppDispatch();
  const { batteries, loading, error } = useAppSelector(
    (state) => state.stationBattery
  );
  const { stations } = useAppSelector((state) => state.station);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6); // Fixed rows per page

  // Fetch station info if not available
  useEffect(() => {
    if (stations.length === 0) {
      dispatch(fetchAllStations());
    }
  }, [dispatch, stations.length]);

  // Fetch batteries
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
      dispatch(fetchBatteriesByStation(stationId));
    }
  };

  // Filter batteries
  const filteredBatteries = useMemo(() => {
    return batteries.filter((battery) => {
      // Search by battery ID
      const matchesSearch = battery.batteryID
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by status
      let matchesStatusFilter = true;
      if (statusFilter !== "all") {
        matchesStatusFilter =
          battery.batteryStatus?.toLowerCase() === statusFilter;
      }

      return matchesSearch && matchesStatusFilter;
    });
  }, [batteries, searchTerm, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination logic
  const pages = Math.ceil(filteredBatteries.length / rowsPerPage);

  const paginatedBatteries = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredBatteries.slice(start, end);
  }, [page, filteredBatteries, rowsPerPage]);

  // Status filter options
  const statusFilterOptions: SelectOption[] = [
    { value: "all", label: "All Status" },
    { value: "available", label: "Available" },
    { value: "faulty", label: "Faulty" },
    { value: "charging", label: "Charging" },
  ];

  // Get status color
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "available") return "success";
    if (statusLower === "faulty") return "danger";
    if (statusLower === "charging") return "warning";
    return "default";
  };

  // Get health color based on SoH
  const getHealthColor = (soH: number) => {
    if (soH >= 80) return "success";
    if (soH >= 50) return "warning";
    return "danger";
  };

  // Render cell content
  const renderCell = (battery: StationBattery, columnKey: React.Key) => {
    switch (columnKey) {
      case "batteryID":
        return (
          <div className="flex items-center gap-2">
            <FaBatteryFull className="text-indigo-600" />
            <p className="font-medium text-gray-900">{battery.batteryID}</p>
          </div>
        );
      case "type":
        return (
          <span className="text-sm text-gray-900">
            {battery.batteryTypeName}
          </span>
        );
      case "status":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(battery.batteryStatus)}
          >
            {battery.batteryStatus || "Unknown"}
          </Chip>
        );
      case "health":
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  battery.soH >= 80
                    ? "bg-green-500"
                    : battery.soH >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${battery.soH}%` }}
              />
            </div>
            <Chip size="sm" variant="flat" color={getHealthColor(battery.soH)}>
              {battery.soH}%
            </Chip>
          </div>
        );
      case "charge":
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${battery.currentPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {battery.currentPercentage}%
            </span>
          </div>
        );
      case "location":
        return (
          <span className="text-sm text-gray-600">
            {battery.currentLocation}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && batteries.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Station Management", href: "/station-management" },
            {
              label: "Station Information",
              href: `/station-management/${stationId}`,
            },
            { label: "Batteries" },
          ]}
          className="mb-4"
        />
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading batteries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Station Management", href: "/station-management" },
            {
              label: "Station Information",
              href: `/station-management/${stationId}`,
            },
            { label: "Batteries" },
          ]}
          className="mb-4"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Station Management", href: "/station-management" },
          {
            label: station?.stationName || "Station Information",
            href: `/station-management/${stationId}`,
          },
          { label: "Batteries" },
        ]}
        className="mb-4 shrink-0"
      />

      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Station Batteries
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

      {/* Filter Bar */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4 shrink-0">
        <div className="flex gap-4 items-center">
          {/* Search by battery ID */}
          <Input
            type="text"
            placeholder="Search by battery ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FaSearch />}
            containerClassName="flex-1"
          />

          {/* Status filter */}
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilterOption)
            }
          />
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredBatteries.length} of {batteries.length} batteries
        </div>
      </div>

      {/* Batteries Table */}
      <div className="flex-1 min-h-0">
        <Table
          aria-label="Station batteries table"
          bottomContent={
            pages > 1 ? (
              <div className="flex w-full justify-center">
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
            <TableColumn key="batteryID">BATTERY ID</TableColumn>
            <TableColumn key="type">TYPE</TableColumn>
            <TableColumn key="status">STATUS</TableColumn>
            <TableColumn key="health">HEALTH (SoH)</TableColumn>
            <TableColumn key="charge">CHARGE</TableColumn>
            <TableColumn key="location">LOCATION</TableColumn>
          </TableHeader>
          <TableBody
            items={paginatedBatteries}
            emptyContent={
              batteries.length === 0
                ? "No batteries found at this station"
                : "No batteries match your search criteria"
            }
          >
            {(item: StationBattery) => (
              <TableRow key={item.batteryID}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
