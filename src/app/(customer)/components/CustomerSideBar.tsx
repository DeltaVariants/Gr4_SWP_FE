"use client";
import React, { useState } from "react";
import {
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHistory,
  FaCreditCard,
  FaQuestionCircle,
} from "react-icons/fa";
import SideBar, {
  NavigationItem,
} from "@/presentation/components/common/SideBar";
import { useAuth } from "@/contexts/AuthContext";

// --- Types ---
interface CustomerSideBarProps {
  currentPath?: string;
}

// --- Dữ liệu Navigation ---
const navigationItems: NavigationItem[] = [
  { name: "Home", path: "/home", icon: <FaHome size={20} /> },
  {
    name: "Find Stations",
    path: "/findstation",
    icon: <FaMapMarkerAlt size={24} />,
  },
  { name: "My Bookings", path: "/booking", icon: <FaCalendarAlt size={24} /> },
  { name: "Swap History", path: "/history", icon: <FaHistory size={24} /> },
  {
    name: "Billing & Plans",
    path: "/billing-plan",
    icon: <FaCreditCard size={24} />,
  },
  { name: "Support", path: "/support", icon: <FaQuestionCircle size={24} /> },
];

// --- Component ---
const CustomerSideBar = ({ currentPath = "/home" }: CustomerSideBarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  const { user: authUser } = useAuth();

  const user = authUser
    ? {
        initials:
          authUser.name && authUser.name.length
            ? authUser.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((s) => s[0].toUpperCase())
                .join("")
            : "NA",
        name: authUser.name || authUser.email || "",
        plan: authUser.role || "",
        avatarUrl: authUser.avatar || undefined,
      }
    : { initials: "NA", name: "", plan: "" };

  return (
    <SideBar
      isExpanded={isExpanded}
      currentPath={currentPath}
      navigationItems={navigationItems}
      onToggle={toggleSidebar}
      user={user}
    />
  );
};

export default CustomerSideBar;
