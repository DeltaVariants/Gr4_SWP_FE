"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaSearch, FaSyncAlt } from "react-icons/fa";
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
import { fetchAllUsers } from "@/application/services/userService";
import { User } from "@/domain/entities/User";
import { Select, SelectOption } from "@/presentation/components/ui/Select";
import { Input } from "@/presentation/components/ui/Input";
import { Actions, ActionItem } from "@/presentation/components/ui/Actions";
import { userRepositoryAPI } from "@/infrastructure/repositories/UserRepositoryAPI.impl";
import { deleteUserUseCase } from "@/application/usecases/user/DeleteUser.usecase";
import { Modal } from "@/presentation/components/ui/Modal";

type RoleFilterOption = "all" | "Admin" | "Staff" | "Driver";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export default function UserManagement() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { users, loading, error, lastFetched } = useAppSelector(
    (state) => state.user
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilterOption>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
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

    if (!isCacheValid || users.length === 0) {
      dispatch(fetchAllUsers({ pageNumber: 1, pageSize: 100 }));
    }
  }, [dispatch, lastFetched, users.length]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    dispatch(fetchAllUsers({ pageNumber: 1, pageSize: 100 }));
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
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search by username, email, or phone
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by role
      const matchesRoleFilter =
        roleFilter === "all" || user.roleName === roleFilter;

      return matchesSearch && matchesRoleFilter;
    });
  }, [users, searchTerm, roleFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter]);

  const handleDeleteClick = useCallback((user: User) => {
    setUserToDelete(user);
    setDeleteError("");
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteUserUseCase(userRepositoryAPI, userToDelete.userID);

      console.log("User deleted successfully:", userToDelete.userID);

      // Refresh danh sách users sau khi xóa thành công
      dispatch(fetchAllUsers({ pageNumber: 1, pageSize: 100 }));

      // Đóng modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Failed to delete user. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError("");
  };

  // Role filter options
  const roleFilterOptions: SelectOption[] = [
    { value: "all", label: "All Roles" },
    { value: "Admin", label: "Admin" },
    { value: "Staff", label: "Staff" },
    { value: "Driver", label: "Driver" },
  ];

  // Pagination logic
  const pages = Math.ceil(filteredUsers.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredUsers.slice(start, end);
  }, [page, filteredUsers, rowsPerPage]);

  // Get role color
  const getRoleColor = (
    role: string
  ): "primary" | "success" | "warning" | "danger" | "default" => {
    switch (role) {
      case "Admin":
        return "danger";
      case "Staff":
        return "primary";
      case "Driver":
        return "success";
      default:
        return "default";
    }
  };

  // Render cell content
  const renderCell = useCallback(
    (user: User, columnKey: React.Key) => {
      switch (columnKey) {
        case "userID":
          return (
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-900">
                {user.userID.length > 20
                  ? `${user.userID.substring(0, 20)}...`
                  : user.userID}
              </p>
            </div>
          );
        case "username":
          return (
            <div className="flex flex-col">
              <p className="font-medium text-gray-900">{user.username}</p>
            </div>
          );
        case "email":
          return <p className="text-sm text-gray-600">{user.email}</p>;
        case "phoneNumber":
          return (
            <p className="text-sm text-gray-600">{user.phoneNumber || "N/A"}</p>
          );
        case "roleName":
          return (
            <Chip size="sm" variant="flat" color={getRoleColor(user.roleName)}>
              {user.roleName}
            </Chip>
          );
        case "actions":
          const actionItems: ActionItem[] = [
            {
              label: "View Details",
              onClick: () => router.push(`/user-management/${user.userID}`),
              tooltip: "View user details",
            },
            {
              label: "Delete User",
              onClick: () => handleDeleteClick(user),
              tooltip: "Delete this user",
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
          {/* Search */}
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<FaSearch />}
            containerClassName="flex-1"
          />

          {/* Role filter */}
          <Select
            options={roleFilterOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilterOption)}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors whitespace-nowrap"
              onClick={() => router.push("/user-management/add")}
            >
              <FaPlus /> Add User
            </button>
          </div>
        </div>

        {/* Results count and refresh button */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredUsers.length} of {users.length} users
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
            title="Refresh user list"
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
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Users Table */}
        {!loading && !error && (
          <div className="flex-1 min-h-0">
            <Table
              aria-label="Users table with client side pagination"
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
                <TableColumn key="userID">USER ID</TableColumn>
                <TableColumn key="username">USER NAME</TableColumn>
                <TableColumn key="email">EMAIL</TableColumn>
                <TableColumn key="phoneNumber">PHONE NUMBER</TableColumn>
                <TableColumn key="roleName">ROLE</TableColumn>
                <TableColumn key="actions">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={items}
                emptyContent="No users found matching your criteria"
              >
                {(item) => (
                  <TableRow key={item.userID}>
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
        {userToDelete && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete user{" "}
              <strong className="text-gray-900">{userToDelete.username}</strong>{" "}
              ({userToDelete.email})? This action cannot be undone.
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
