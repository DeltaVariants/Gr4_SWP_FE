import React from "react";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

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
    <div className="min-h-screen bg-[#E6F4FE] flex overflow-hidden">
      <Sidebar currentPath={currentPath} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-0 overflow-auto">
        <Header title={headerTitle} subtitle={headerSubtitle} />

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 space-y-6 max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
