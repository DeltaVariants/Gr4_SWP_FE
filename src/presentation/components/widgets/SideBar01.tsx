"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHistory,
  FaCreditCard,
  FaQuestionCircle,
  FaBars,
} from "react-icons/fa";

// --- Types ---
interface SidebarProps {
  currentPath?: string;
}

type NavigationItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

// --- Dữ liệu Navigation ---
const navigationItems: NavigationItem[] = [
  { name: "Home", path: "/home", icon: <FaHome size={20} /> },
  {
    name: "Find Stations",
    path: "/findstation",
    icon: <FaMapMarkerAlt size={24} />,
  },
  { name: "My Bookings", path: "/bookings", icon: <FaCalendarAlt size={24} /> },
  { name: "Swap History", path: "/history", icon: <FaHistory size={24} /> },
  {
    name: "Billing & Plans",
    path: "/billing",
    icon: <FaCreditCard size={24} />,
  },
  { name: "Support", path: "/support", icon: <FaQuestionCircle size={24} /> },
];

// --- Component ---
const SideBar01 = ({ currentPath = "/home" }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`h-screen flex flex-col sticky top-0 z-10 transition-all duration-300 ease-in-out bg-white shadow-[0_4px_4px_rgba(0,0,0,0.1)] ${
        isExpanded ? "w-60" : "w-22"
      }`}
    >
      {/* Logo Section*/}
      <div
        className={`p-4 flex items-center flex-shrink-0 border-b border-gray-200 transition-all duration-300 ease-in-out `}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {/* Logo */}
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* --- Nút Hamburger --- */}
      <div className={`p-4 flex justify-start border-b border-gray-200`}>
        <button
          onClick={toggleSidebar}
          className="bg-transparent border-none cursor-pointer p-4 rounded-lg flex items-center justify-center transition-colors duration-200 text-gray-700 hover:bg-gray-100"
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* --- Menu Items --- */}
      <nav className="flex-1 py-4 flex flex-col gap-2">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <Link href={item.path} key={item.name}>
              <div
                className={`flex items-center px-4 py-4 cursor-pointer transition-all duration-200 mx-4 rounded-xl gap-4 ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={!isExpanded ? item.name : ""}
              >
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  {item.icon}
                </div>
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${
                    isExpanded
                      ? "opacity-100 delay-150"
                      : "opacity-0 absolute left-full" // Thêm absolute và left-full để ẩn hoàn toàn khi collapsed
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* --- User Profile Section --- */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div
          className={`ml-1.5 flex items-center ${
            isExpanded ? "space-x-3" : ""
          }`}
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">NA</span>
          </div>
          <div
            className={`transition-opacity duration-200 ${
              isExpanded
                ? "opacity-100 delay-150"
                : "opacity-0 absolute left-full"
            }`}
          >
            {/* Ẩn hoàn toàn khi collapsed */}
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
              Nguyen Van A
            </p>
            <p className="text-xs text-gray-500 whitespace-nowrap">
              Premium Plan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar01;
