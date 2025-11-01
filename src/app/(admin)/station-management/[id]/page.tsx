"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function StationDetail() {
  const params = useParams();
  const stationId = params.id;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/station-management"
            className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
          >
            ← Back to Stations
          </Link>
          <h2 className="text-2xl font-semibold">Station Details</h2>
        </div>
        <Link
          href={`/station-management/${stationId}/edit`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Edit Station
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600 mb-4">
          Viewing details for Station ID:{" "}
          <span className="font-semibold">{stationId}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Station Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Station Name</label>
                <p className="font-medium">Station {stationId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Location</label>
                <p className="font-medium">Address placeholder</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className="font-medium">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Battery Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Total Slots</label>
                <p className="font-medium">20</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">
                  Available Batteries
                </label>
                <p className="font-medium">15</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">In Use</label>
                <p className="font-medium">5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
