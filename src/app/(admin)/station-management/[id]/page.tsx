"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/application/hooks/useRedux";
import { fetchAllStations } from "@/application/services/Hoang/stationService";

export default function StationDetail() {
  const params = useParams();
  const stationId = params.id as string;
  const dispatch = useAppDispatch();
  const { stations, loading, error } = useAppSelector((state) => state.station);

  useEffect(() => {
    if (stations.length === 0) {
      dispatch(fetchAllStations());
    }
  }, [dispatch, stations.length]);

  const station = stations.find((s) => s.stationID === stationId);

  if (loading) {
    return (
      <div>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading station details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Link
            href="/station-management"
            className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
          >
            ← Back to Stations
          </Link>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Station not found</p>
          <Link
            href="/station-management"
            className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
          >
            ← Back to Stations
          </Link>
        </div>
      </div>
    );
  }

  const batteryPercentage = (station.batteryInSlots / station.slotNumber) * 100;
  const isActive = station.batteryInSlots > 0 || station.batteryOutSlots > 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/station-management"
            className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Stations
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900">
            {station.stationName}
          </h2>
        </div>
        <Link
          href={`/station-management/${stationId}/edit`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Edit Station
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Station Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Station ID</label>
                <p className="font-medium text-gray-900">{station.stationID}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Station Name</label>
                <p className="font-medium text-gray-900">
                  {station.stationName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Location</label>
                <p className="font-medium text-gray-900">
                  {station.stationLocation}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className="font-medium">
                  <span
                    className={`px-2 py-1 rounded ${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Battery Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Total Slots</label>
                <p className="font-medium text-gray-900">
                  {station.slotNumber}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Available Batteries (Ready to Use)
                </label>
                <p className="font-medium text-gray-900">
                  {station.batteryInSlots}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Batteries Out (In Use / Charging)
                </label>
                <p className="font-medium text-gray-900">
                  {station.batteryOutSlots}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Battery Availability
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        batteryPercentage < 30
                          ? "bg-red-500"
                          : batteryPercentage < 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${batteryPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(batteryPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Slot Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Total Slots</p>
              <p className="text-2xl font-bold text-blue-900">
                {station.slotNumber}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Batteries In</p>
              <p className="text-2xl font-bold text-green-900">
                {station.batteryInSlots}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 mb-1">Batteries Out</p>
              <p className="text-2xl font-bold text-orange-900">
                {station.batteryOutSlots}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Empty Slots</p>
              <p className="text-2xl font-bold text-purple-900">
                {station.slotNumber -
                  station.batteryInSlots -
                  station.batteryOutSlots}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
