"use client";
import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBatteryFull,
  FaChargingStation,
  FaUsers,
  FaFileInvoiceDollar,
  FaCog,
} from "react-icons/fa";
import SideBar, {
  NavigationItem,
} from "@/presentation/components/common/SideBar";

// --- Types ---
interface AdminSideBarProps {
  currentPath?: string;
}

// --- Dữ liệu Navigation ---
const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaTachometerAlt size={20} />,
  },
  {
    name: "Battery",
    path: "/battery-management",
    icon: <FaBatteryFull size={20} />,
  },
  {
    name: "Stations",
    path: "/station-management",
    icon: <FaChargingStation size={20} />,
  },
  {
    name: "User",
    path: "/user-management",
    icon: <FaUsers size={20} />,
  },
  {
    name: "Reports",
    path: "/transactions-reports",
    icon: <FaFileInvoiceDollar size={20} />,
  },
  {
    name: "System",
    path: "/system-config",
    icon: <FaCog size={20} />,
  },
];

// --- Component ---
const AdminSideBar = ({ currentPath = "/dashboard" }: AdminSideBarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  const user = {
    initials: "AD",
    name: "Admin User",
    plan: "Administrator",
  };

  return (
    <SideBar
      isExpanded={isExpanded}
      currentPath={currentPath}
      navigationItems={navigationItems}
      onToggle={toggleSidebar}
      user={user}
      isAdmin={true}
    />
  );
};

export default AdminSideBar;
