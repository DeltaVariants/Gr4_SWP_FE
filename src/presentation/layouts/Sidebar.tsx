"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  HiMenu,
  HiHome,
  HiLocationMarker,
  HiOutlineTruck,
  HiOutlineCalendar,
  HiClock,
  HiOutlineCreditCard,
  HiOutlineQuestionMarkCircle,
  HiUser,
} from "react-icons/hi";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user: authUser } = useAuth();
  const displayedName = authUser?.name || authUser?.email || "User";
  const displayedPlan = authUser?.role || "Premium Plan";

  const menuItems = [
    { icon: HiHome, label: "Home", href: "/home" },
    { icon: HiLocationMarker, label: "Find Stations", href: "/stations" },
    { icon: HiOutlineTruck, label: "My vehicles", href: "/vehicles" },
    { icon: HiOutlineCalendar, label: "My Bookings", href: "/bookings" },
    { icon: HiClock, label: "Swap History", href: "/history" },
    { icon: HiOutlineCreditCard, label: "Billing & Plans", href: "/billing" },
    { icon: HiOutlineQuestionMarkCircle, label: "Support", href: "/support" },
  ];

  // Helper function to check if a menu item is active
  const isMenuItemActive = (href: string, currentPath: string) => {
    const normalizedCurrent = currentPath.split("?")[0].replace(/\/+$/, "");
    const normalizedHref = href.replace(/\/+$/, "");

    // Check if current path matches exactly OR starts with the href (for nested routes)
    return (
      normalizedCurrent === normalizedHref ||
      (normalizedCurrent.startsWith(normalizedHref + "/") &&
        normalizedHref !== "")
    );
  };

  // Get current path (you may need to use usePathname from next/navigation)
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/home";

  return (
    <div
      className={`bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      } min-h-screen flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-500/30">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">ESi</div>
              <div className="text-sm opacity-80">eSwap</div>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-blue-500/30 rounded-lg transition-colors"
          >
            <HiMenu size={24} />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = isMenuItemActive(item.href, currentPath);
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors group ${
                  isActive
                    ? "bg-blue-400/30 text-white"
                    : "hover:bg-blue-500/20 text-blue-100"
                }`}
              >
                <IconComponent size={20} className="shrink-0" />
                {isExpanded && (
                  <span className="font-medium">{item.label}</span>
                )}
                {!isExpanded && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-blue-500/30">
        <div
          className={`flex items-center space-x-3 ${
            !isExpanded && "justify-center"
          }`}
        >
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
            <HiUser size={20} />
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <Link 
                href="/profile" 
                className="font-medium hover:underline truncate block"
                title={displayedName}
              >
                {displayedName}
              </Link>
              <div className="text-sm text-blue-200 truncate" title={displayedPlan}>
                {displayedPlan}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
