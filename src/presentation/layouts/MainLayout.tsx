import React from "react";
import CustomerHeader from "@/app/(customer)/components/CustomerHeader";
import CustomerSideBar from "@/app/(customer)/components/CustomerSideBar";

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

export default function MainLayout({
  children,
  currentPath = "/home",
  headerTitle = "Home",
  headerSubtitle = "Welcome back! Monitor your EV battery status and find nearby swap stations.",
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <CustomerSideBar currentPath={currentPath} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-0">
        <CustomerHeader title={headerTitle} subtitle={headerSubtitle} />

        {/* Main Dashboard Content */}
        <main className="flex-1 p-[3vh] max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
