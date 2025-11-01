"use client";
import React from "react";
import { usePathname } from "next/navigation";
import MainLayout from "../../presentation/layouts/MainLayout";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Map paths to header titles and subtitles
const getPageInfo = (pathname: string) => {
  switch (pathname) {
    case "/dashboard":
      return {
        title: "Dashboard",
        subtitle: "Overview of system metrics and key performance indicators.",
      };
    case "/battery-management":
      return {
        title: "Battery Management",
        subtitle:
          "Monitor and manage battery inventory, status, and lifecycle.",
      };
    case "/station-management":
      return {
        title: "Station Management",
        subtitle: "Manage swap stations, locations, and operational status.",
      };
    case "/user-management":
      return {
        title: "User Management",
        subtitle: "Manage user accounts, roles, and permissions.",
      };
    case "/transactions-reports":
      return {
        title: "Transactions & Reports",
        subtitle: "View transaction history and generate reports.",
      };
    case "/system-config":
      return {
        title: "System Configuration",
        subtitle: "Configure system settings and parameters.",
      };
    default:
      return {
        title: "Admin Dashboard",
        subtitle: "Overview of system metrics and key performance indicators.",
      };
  }
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <MainLayout
      sidebar={<AdminSidebar currentPath={pathname} />}
      header={
        <AdminHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
      }
    >
      {children}
    </MainLayout>
  );
}
