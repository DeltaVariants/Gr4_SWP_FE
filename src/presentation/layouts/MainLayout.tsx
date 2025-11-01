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
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      {sidebar}

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-0">
        {/* Header */}
        {header}

        {/* Main Dashboard Content */}
        <main className="flex-1 p-[3vh] max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
