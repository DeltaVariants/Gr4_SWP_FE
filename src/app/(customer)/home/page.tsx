"use client";

import React from "react";
import { BatteryAlert, StatsGrid, CarsSection } from "../../../presentation";

export default function HomePage() {
  // Mock data - in a real app, this would come from state management or API
  const statsData = {
    currentBattery: 28,
    monthlySwaps: 8,
    remainingSwaps: 22,
    carbonSaved: 245,
  };

  const carsData = [
    {
      id: "1",
      brand: "Vinfast",
      model: "VF8",
      batteryPercentage: 58,
      range: 1576,
    },
    {
      id: "2",
      brand: "Vinfast",
      model: "VF8",
      batteryPercentage: 58,
      range: 1576,
    },
  ];

  // Event handlers
  const handleFindStation = () => {
    console.log("Find station clicked");
    // Navigate to find stations page
  };

  const handleDismissAlert = () => {
    console.log("Dismiss alert clicked");
    // Hide the battery alert
  };

  const handleAddCar = () => {
    console.log("Add car clicked");
    // Navigate to add car page or open modal
  };

  return (
    <>
      {/* Battery Alert */}
      <BatteryAlert
        batteryPercentage={28}
        range={85}
        onFindStation={handleFindStation}
        onDismiss={handleDismissAlert}
      />

      {/* Stats Cards */}
      <StatsGrid data={statsData} />

      {/* My Cars Section */}
      <CarsSection cars={carsData} onAddCar={handleAddCar} />
    </>
  );
}
