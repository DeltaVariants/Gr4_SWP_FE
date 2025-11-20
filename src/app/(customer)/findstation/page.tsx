"use client";

import { withCustomerAuth } from '@/hoc/withAuth';
import React from "react";
import { MapSection } from "../../../presentation";
import MapSideBar from "@/presentation/components/features/MapSection/MapSideBar";

const FindStationPage = () => {
  return (
    <div className="h-full relative">
      <MapSection />
      {/* Sidebar overlay - chiều rộng cố định 320px bên trái, đè lên map */}
      <div className="absolute left-0 top-0 bottom-0 w-80 z-1000 pointer-events-none">
        <div className="h-full pointer-events-auto">
          <MapSideBar />
        </div>
      </div>
    </div>
  );
};

export default withCustomerAuth(FindStationPage);
