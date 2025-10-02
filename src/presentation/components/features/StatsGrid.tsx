import React from "react";
import StatCard from "../ui/StatCard";

interface StatsData {
  currentBattery: number;
  monthlySwaps: number;
  remainingSwaps: number;
  carbonSaved: number;
}

interface StatsGridProps {
  data: StatsData;
}

export default function StatsGrid({ data }: StatsGridProps) {
  const batteryIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.856.048L10 12l-1.111 5.304a1 1 0 01-1.856-.048L5.854 12.8 2.5 10.866a1 1 0 010-1.732L5.854 7.2l1.179-4.456A1 1 0 018 2h4z"
        clipRule="evenodd"
      />
    </svg>
  );

  const swapIcon = (
    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
  );

  const planIcon = (
    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const carbonIcon = (
    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
      />
    </svg>
  );

  const upArrowIcon = (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Current Battery"
        value={`${data.currentBattery}%`}
        subtitle="~85 km range"
        valueColor="warning"
        icon={batteryIcon}
        bgColor="bg-[#F59E0B]/10"
      />

      <StatCard
        title="This Month Swaps"
        value={data.monthlySwaps.toString()}
        subtitle="+2 from last month"
        valueColor="default"
        icon={upArrowIcon}
        bgColor="bg-gray-100"
      />

      <StatCard
        title="Remaining Swaps"
        value={data.remainingSwaps.toString()}
        subtitle="Premium Plan"
        valueColor="default"
        icon={planIcon}
        bgColor="bg-gray-100"
      />

      <StatCard
        title="Carbon Saved"
        value={`${data.carbonSaved} kg`}
        valueColor="default"
        icon={carbonIcon}
        bgColor="bg-gray-100"
      />
    </div>
  );
}
