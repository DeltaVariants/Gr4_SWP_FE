"use client";
import Link from "next/link";
import { FaPlus, FaMap, FaExchangeAlt, FaEye, FaEdit } from "react-icons/fa";

export default function StationManagement() {
  // Mock data for stations
  const stations = [
    {
      id: 1,
      name: "Station A",
      address: "123 Main St",
      status: "Active",
      available: 15,
      total: 20,
    },
    {
      id: 2,
      name: "Station B",
      address: "456 Oak Ave",
      status: "Active",
      available: 12,
      total: 20,
    },
    {
      id: 3,
      name: "Station C",
      address: "789 Pine Rd",
      status: "Maintenance",
      available: 8,
      total: 20,
    },
    {
      id: 4,
      name: "Station D",
      address: "321 Elm St",
      status: "Active",
      available: 5,
      total: 15,
    },
  ];

  return (
    <div className="p-6">
      {/* Header with Action Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Station Management</h2>
          <p className="text-gray-600">Manage all battery swap stations</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/station-management/monitor"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaMap /> Monitor
          </Link>
          <Link
            href="/station-management/battery-distribute"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <FaExchangeAlt /> Distribute
          </Link>
          <Link
            href="/station-management/add"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <FaPlus /> Add Station
          </Link>
        </div>
      </div>

      {/* Stations List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batteries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stations.map((station) => (
              <tr key={station.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {station.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{station.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      station.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {station.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {station.available}/{station.total} available
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <Link
                      href={`/station-management/${station.id}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FaEye /> View
                    </Link>
                    <Link
                      href={`/station-management/${station.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
