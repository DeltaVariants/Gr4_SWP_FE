"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/presentation/hooks/useAuth';
import CarInfoCard from "./components/CarInfoCard";
import BatteryStatusCard from "./components/BatteryStatusCard";
import BookingInfoCard from "./components/BookingInfoCard";
import StatsSummaryCard from "./components/StatsSummaryCard";
import ActivitiesLog from "./components/ActivitiesLog";
import RecentStationsList from "./components/RecentStationsList";
import { MapSection } from "@/presentation/components/features";

function CustomerHomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // Handle Google OAuth callback redirect - MUST run before auth check
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    
    if (token) {
      console.log('[Home] Detected Google OAuth token, redirecting to /google-callback');
      setIsProcessingOAuth(true);
      
      // Backend redirected here instead of /google-callback
      // Forward to proper callback handler
      const params = new URLSearchParams();
      params.set('token', token);
      if (refreshToken) params.set('refreshToken', refreshToken);
      
      // Use window.location for hard redirect to ensure clean state
      window.location.href = `/google-callback?${params.toString()}`;
      return;
    }
  }, [searchParams]);

  // Manual auth check - redirect if not authenticated
  useEffect(() => {
    if (isProcessingOAuth) return; // Skip auth check if processing OAuth
    
    if (!loading && !user) {
      console.log('[Home] Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router, isProcessingOAuth]);

  // Show loading during OAuth processing or auth check
  if (isProcessingOAuth || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isProcessingOAuth ? 'Processing Google login...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }
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

export default CustomerHomePage;
