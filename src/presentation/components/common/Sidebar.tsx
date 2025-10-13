import React from "react";

interface SidebarProps {
  currentPath?: string;
}
type NavigationItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};
const navigationItems: NavigationItem[] = [
  {
    name: "Home",
    path: "/home",
    icon: (
      <svg
        className="w-3 h-3 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    name: "Find Stations",
    path: "/stations",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "My Bookings",
    path: "/bookings",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Swap History",
    path: "/history",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Billing & Plans",
    path: "/billing",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 10a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H7z" />
      </svg>
    ),
  },
  {
    name: "Support",
    path: "/support",
    icon: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function Sidebar({ currentPath = "/home" }: SidebarProps) {
  return (
    <div className="w-64 bg-gradient-to-b from-[#1E5A8C] to-[#0A4A7C] text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-6 flex items-center space-x-3 flex-shrink-0">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
        <div>
          <h1 className="text-xl font-semibold">eSwap</h1>
          <p className="text-sm opacity-80">Driver Portal</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <div
              key={item.name}
              className={`px-4 py-3 flex items-center space-x-3 rounded-lg cursor-pointer transition-colors ${
                isActive ? "bg-white/75" : "hover:bg-white/10"
              }`}
            >
              <div
                className={`w-5 h-5 flex items-center justify-center ${
                  isActive
                    ? "bg-gradient-to-r from-[#295E9C] to-[#1C4078] rounded"
                    : ""
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`${
                  isActive ? "font-bold text-[#295E9C]" : "text-white"
                }`}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/25 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-black">NA</span>
          </div>
          <div>
            <p className="text-sm font-medium">Nguyen Van A</p>
            <p className="text-xs opacity-80">Premium Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
