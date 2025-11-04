"use client";
import React from "react";
import { usePathname } from "next/navigation";
import MainLayout from "../../presentation/layouts/MainLayout";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import AdminAuthGuard from "./components/AdminAuthGuard";
import { BreadcrumbItem } from "@/presentation/components/common/Header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Map paths to breadcrumbs
const getBreadcrumbs = (pathname: string): BreadcrumbItem[] | undefined => {
  // Station Management breadcrumbs
  if (pathname.startsWith("/station-management")) {
    if (pathname === "/station-management") {
      return undefined; // No breadcrumbs for main page
    }

    const base: BreadcrumbItem = {
      label: "Station Management",
      path: "/station-management",
    };

    if (pathname === "/station-management/add") {
      return [base, { label: "Add", path: "/station-management/add" }];
    }

    if (pathname === "/station-management/monitor") {
      return [base, { label: "Monitor", path: "/station-management/monitor" }];
    }

    if (pathname === "/station-management/battery-distribute") {
      return [
        base,
        {
          label: "Battery Distribute",
          path: "/station-management/battery-distribute",
        },
      ];
    }

    // Match /station-management/[id]
    const detailMatch = pathname.match(/^\/station-management\/(\d+)$/);
    if (detailMatch) {
      return [base, { label: "Detail", path: pathname }];
    }

    // Match /station-management/[id]/edit
    const editMatch = pathname.match(/^\/station-management\/(\d+)\/edit$/);
    if (editMatch) {
      const id = editMatch[1];
      return [
        base,
        { label: "Detail", path: `/station-management/${id}` },
        { label: "Edit", path: pathname },
      ];
    }
  }

  // Battery Management breadcrumbs
  if (
    pathname.startsWith("/battery-management") &&
    pathname !== "/battery-management"
  ) {
    const base: BreadcrumbItem = {
      label: "Battery Management",
      path: "/battery-management",
    };
    // Add more battery management sub-routes here
    return [base];
  }

  // User Management breadcrumbs
  if (
    pathname.startsWith("/user-management") &&
    pathname !== "/user-management"
  ) {
    const base: BreadcrumbItem = {
      label: "User Management",
      path: "/user-management",
    };
    // Add more user management sub-routes here
    return [base];
  }

  return undefined;
};

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
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <AdminAuthGuard>
      <MainLayout
        sidebar={<AdminSidebar currentPath={pathname} />}
        header={
          <AdminHeader
            title={pageInfo.title}
            subtitle={pageInfo.subtitle}
            breadcrumbs={breadcrumbs}
          />
        }
      >
        {children}
      </MainLayout>
    </AdminAuthGuard>
  );
}
