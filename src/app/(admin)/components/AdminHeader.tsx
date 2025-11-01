"use client";
import React, { useState } from "react";
import Header from "@/presentation/components/common/Header";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ title = "Dashboard" }: AdminHeaderProps) {
  // Mock weather data - in real app, this would come from an API or context
  const weather = {
    temperature: "24°C",
    condition: "Sunny",
  };

  // Track notification state
  const [hasNotifications] = useState(true);

  // Handler functions for user interactions
  const handleNotificationClick = () => {
    console.log("Notification clicked");
    // TODO: Open notification panel or navigate to notifications page
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
    // TODO: Open settings panel or navigate to settings page
  };

  return (
    <Header
      title={title}
      weather={weather}
      hasNotifications={hasNotifications}
      onNotificationClick={handleNotificationClick}
      onSettingsClick={handleSettingsClick}
    />
  );
}
