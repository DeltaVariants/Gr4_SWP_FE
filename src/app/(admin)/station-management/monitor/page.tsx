"use client";
import Link from "next/link";

export default function StationMonitor() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/station-management"
          className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
        >
          ← Back to Stations
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Map Container */}
        <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-gray-600 font-medium">Map View Placeholder</p>
            <p className="text-sm text-gray-500 mt-2">
              Integrate Google Maps or Mapbox here
            </p>
          </div>
        </div>

        {/* Station Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">
              Active Stations
            </p>
            <p className="text-2xl font-bold text-green-700">45</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-700">3</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Offline</p>
            <p className="text-2xl font-bold text-red-700">2</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Stations</p>
            <p className="text-2xl font-bold text-blue-700">50</p>
          </div>
        </div>
      </div>
    </div>
  );
}
