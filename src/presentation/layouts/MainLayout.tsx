import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export default function MainLayout({
  children,
  sidebar,
  header,
}: MainLayoutProps) {
  return (
    <div className="h-screen bg-[#f5f5f5] flex overflow-hidden">
      {/* Sidebar */}
      {sidebar}

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-0 overflow-hidden">
        {/* Header - Fixed position */}
        <div className="shrink-0 z-40 bg-white shadow-sm">{header}</div>

        {/* Main Dashboard Content - No scroll, children control their own scroll */}
        <main className="flex-1 p-[3vh] overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
