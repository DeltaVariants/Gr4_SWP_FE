"use client";
import { useState } from "react";
import Link from "next/link";

export default function BatteryDistribute() {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle battery distribution
    alert(
      `Distributing ${quantity} batteries from Station ${fromStation} to Station ${toStation}`
    );
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/station-management"
          className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
        >
          ← Back to Stations
        </Link>
        <h2 className="text-2xl font-semibold">Battery Distribution</h2>
        <p className="text-gray-600">Transfer batteries between stations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Transfer Request</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Station *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    required
                  >
                    <option value="">Select station</option>
                    <option value="1">Station A (Available: 20)</option>
                    <option value="2">Station B (Available: 15)</option>
                    <option value="3">Station C (Available: 18)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Station *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={toStation}
                    onChange={(e) => setToStation(e.target.value)}
                    required
                  >
                    <option value="">Select station</option>
                    <option value="4">Station D (Available: 5)</option>
                    <option value="5">Station E (Available: 8)</option>
                    <option value="6">Station F (Available: 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add any notes for this transfer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Submit Transfer
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Transfer History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transfers</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="border-l-4 border-indigo-500 pl-4 py-2"
                >
                  <p className="text-sm font-medium">Station A → Station D</p>
                  <p className="text-xs text-gray-500">10 batteries</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
