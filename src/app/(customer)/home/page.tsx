"use client";
import React from "react";
import CarInfoCard from "./components/CarInfoCard";
import BatteryStatusCard from "./components/BatteryStatusCard";
import BookingInfoCard from "./components/BookingInfoCard";
import StatsSummaryCard from "./components/StatsSummaryCard";
import ActivitiesLog from "./components/ActivitiesLog";
import RecentStationsList from "./components/RecentStationsList";
import { MapSection } from "@/presentation/components/features";

export default function CustomerHomePage() {
  const handleFindStation = () => {
    console.log("Find station clicked");
    // TODO: Navigate to find station page
  };

  const handleViewAllActivities = () => {
    console.log("View all activities clicked");
    // TODO: Navigate to activities page
  };

  const handleSearchStations = () => {
    console.log("Search stations clicked");
    // TODO: Implement search functionality
  };

  const handleStationSelect = (station: {
    id: string;
    name: string;
    address: string;
    distance: string;
  }) => {
    console.log("Station selected:", station);
    // TODO: Navigate to station details or booking
  };

  return (
    <div>
      {/* Main Content - Takes remaining height after header */}
      <div className="flex-1">
        {/* Top Section - 60% height */}
        <div className="h-[60%] grid grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="flex flex-col">
            {/* Car Info Card */}
            <div>
              <CarInfoCard />
            </div>

            {/* Battery Status Card */}
            <div className="h-full">
              <BatteryStatusCard onFindStation={handleFindStation} />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2">
            {/* Booking Info Card */}
            <div>
              <BookingInfoCard />
            </div>

            {/* Stats Summary Card */}
            <div>
              <StatsSummaryCard />
            </div>

            {/* Activities Log */}
            <div>
              <ActivitiesLog onViewAll={handleViewAllActivities} />
            </div>
          </div>
        </div>

        {/* Bottom Section - 40% height */}
        <div className="h-[40%] grid grid-cols-2 gap-6">
          {/* Recent Stations List */}
          <div className="h-full">
            <RecentStationsList
              onSearch={handleSearchStations}
              onStationSelect={handleStationSelect}
            />
          </div>

          {/* Map Section */}
          <div className="h-full">
            <MapSection />
          </div>
        </div>
      </div>
    </div>
  );
}
