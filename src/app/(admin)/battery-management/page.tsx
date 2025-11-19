import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
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
import { fetchAllBatteries } from "@/application/services/batteryService";
import { BatteryDTO } from "@/domain/dto/Duy/BatteryDTO";
import { getBatteryTypeFromId } from "@/domain/entities/Battery";
import { Select, SelectOption } from "@/presentation/components/ui/Select";
import { Input } from "@/presentation/components/ui/Input";

type StatusFilterOption = "all" | "available" | "faulty" | "null";
type TypeFilterOption = "all" | "Large" | "Medium" | "Small";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export default function BatteryManagement() {
  const dispatch = useAppDispatch();
  const { batteries, loading, error, lastFetched, pagination } = useAppSelector(
    (state) => state.battery
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilterOption>("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate rows per page based on container height
  useEffect(() => {
    const updateRowsPerPage = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const headerHeight = 48;
        const paginationHeight = 60;
        const padding = 20;
        const rowHeight = 65;

        const availableHeight =
          containerHeight - headerHeight - paginationHeight - padding;
        const calculatedRows = Math.floor(availableHeight / rowHeight);
        const newRowsPerPage = Math.max(7, Math.min(12, calculatedRows));
        setRowsPerPage(newRowsPerPage);
      }
    };

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

    if (!isCacheValid || batteries.length === 0) {
      dispatch(
        fetchAllBatteries({
          pageNumber: page,
          pageSize: 100,
          typeName: typeFilter !== "all" ? typeFilter : undefined,
        })
      ); // Fetch more items for client-side filtering
    }
  }, [dispatch, lastFetched, batteries.length, page, typeFilter]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    dispatch(
      fetchAllBatteries({
        pageNumber: 1,
        pageSize: 100,
        typeName: typeFilter !== "all" ? typeFilter : undefined,
      })
    );
    setPage(1);
  }, [dispatch, typeFilter]);

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
  const filteredBatteries = useMemo(() => {
    return batteries.filter((battery) => {
      // Search by battery ID
      const matchesSearch = battery.batteryID
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by status
      let matchesStatusFilter = true;
      if (statusFilter === "available") {
        matchesStatusFilter = battery.status === "available";
      } else if (statusFilter === "faulty") {
        matchesStatusFilter = battery.status === "faulty";
      } else if (statusFilter === "null") {
        matchesStatusFilter = battery.status === null;
      }

      // Filter by type (based on batteryID prefix)
      let matchesTypeFilter = true;
      if (typeFilter !== "all") {
        const batteryType = getBatteryTypeFromId(battery.batteryTypeID);
        matchesTypeFilter = batteryType === typeFilter;
      }

      return matchesSearch && matchesStatusFilter && matchesTypeFilter;
    });
  }, [batteries, searchTerm, statusFilter, typeFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  // Status filter options
  const statusFilterOptions: SelectOption[] = [
    { value: "all", label: "All Status" },
    { value: "available", label: "Available" },
    { value: "faulty", label: "Faulty" },
    { value: "null", label: "Unassigned" },
  ];

  // Type filter options
  const typeFilterOptions: SelectOption[] = [
    { value: "all", label: "All Types" },
    { value: "Large", label: "Large" },
    { value: "Medium", label: "Medium" },
    { value: "Small", label: "Small" },
  ];

  // Pagination logic
  const pages = Math.ceil(filteredBatteries.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredBatteries.slice(start, end);
  }, [page, filteredBatteries, rowsPerPage]);

  // Get status color
  const getStatusColor = (status: string | null) => {
    if (status === "available") return "success";
    if (status === "faulty") return "danger";
    return "default";
  };

  // Get status label
  const getStatusLabel = (status: string | null) => {
    if (status === null) return "Unassigned";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get health color based on SoH
  const getHealthColor = (soH: number) => {
    if (soH >= 80) return "success";
    if (soH >= 50) return "warning";
    return "danger";
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render cell content
  const renderCell = useCallback(
    (battery: BatteryDTO, columnKey: React.Key) => {
      switch (columnKey) {
        case "batteryID":
          return (
            <p className="font-medium text-gray-900">{battery.batteryID}</p>
          );
        case "type":
          const batteryType = getBatteryTypeFromId(battery.batteryTypeID);
          return <span className="text-sm text-gray-900">{batteryType}</span>;
        case "status":
          return (
            <Chip
              size="sm"
              variant="flat"
              color={getStatusColor(battery.status)}
            >
              {getStatusLabel(battery.status)}
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
              <Chip
                size="sm"
                variant="flat"
                color={getHealthColor(battery.soH)}
              >
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
                  style={{ width: `${battery.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {battery.percentage}%
              </span>
            </div>
          );
        case "location":
          return (
            <span className="text-sm text-gray-600">{battery.position}</span>
          );
        case "createdAt":
          return (
            <span className="text-sm text-gray-600">
              {formatDate(new Date().toISOString())}
            </span>
          );
        default:
          return null;
      }
    },
    []
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Bar */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4 shrink-0">
        <div className="flex gap-4 items-center mb-3">
          {/* Search by battery ID */}
          <Input
            type="text"
            placeholder="Search by battery ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FaSearch />}
            containerClassName="flex-1"
          />

          {/* Type filter */}
          <Select
            options={typeFilterOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilterOption)}
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

        {/* Results count and refresh button */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredBatteries.length} of {batteries.length} batteries
            {isCacheValid && !loading && timeSinceLastFetch && (
              <span className="ml-2 text-green-600">
                • Cached ({timeSinceLastFetch})
              </span>
            )}
            {pagination && (
              <span className="ml-2">
                • Total: {pagination.totalItems} batteries
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
            title="Refresh battery list"
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
            <p className="mt-2 text-gray-600">Loading batteries...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Batteries Table */}
        {!loading && !error && (
          <div className="flex-1 min-h-0">
            <Table
              aria-label="Batteries table with client side pagination"
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
                <TableColumn key="createdAt">CREATED</TableColumn>
              </TableHeader>
              <TableBody
                items={items}
                emptyContent="No batteries found matching your criteria"
              >
                {(item: BatteryDTO) => (
                  <TableRow key={item.batteryID}>
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
    </div>
  );
}
