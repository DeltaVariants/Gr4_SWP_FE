"use client";
import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import MainLayout from "../../presentation/layouts/MainLayout";
import CustomerHeader from "./components/CustomerHeader";
import CustomerSideBar from "./components/CustomerSideBar";
import { BreadcrumbItem } from "@/presentation/components/common/Header";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

// Route configuration with parent relationships
const routeConfig: Record<
  string,
  { title: string; subtitle: string; parent?: string }
> = {
  "/home": {
    title: "Home",
    subtitle:
      "Welcome back! Monitor your EV battery status and find nearby swap stations.",
  },
  "/findstation": {
    title: "Find Station",
    subtitle: "Locate nearby battery swap stations and check availability.",
  },
  "/booking": {
    title: "My Bookings",
    subtitle: "View and manage your battery swap reservations.",
  },
  "/history": {
    title: "Swap History",
    subtitle: "Review your past battery swap transactions and activity.",
  },
  "/billing-plan": {
    title: "Billing & Plans",
    subtitle: "Manage your subscription plans and payment methods.",
  },
  "/support": {
    title: "Support",
    subtitle: "Get help and contact our customer service team.",
  },
};

// Generate breadcrumbs based on pathname
const generateBreadcrumbs = (
  pathname: string,
  searchParams: URLSearchParams
): BreadcrumbItem[] | undefined => {
  const segments = pathname.split("/").filter(Boolean);

  // If only one segment or directly matches a main route, no breadcrumbs needed
  if (segments.length <= 1 || routeConfig[pathname]) {
    return undefined;
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = "";

  // Build breadcrumbs from path segments
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;

    // Check if this path exists in our route config
    const routeInfo = routeConfig[currentPath];

    if (routeInfo) {
      breadcrumbs.push({
        label: routeInfo.title,
        path: currentPath,
      });
    } else if (i === segments.length - 1) {
      // Last segment - create a breadcrumb even if not in config
      let label: string;

      // Check if this is a dynamic route with station name in search params
      if (pathname.includes("/findstation/") && searchParams.get("name")) {
        label = searchParams.get("name") || segments[i];
      } else {
        // Capitalize and format the segment name
        label = segments[i]
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      breadcrumbs.push({
        label,
        path: currentPath,
      });
    }
  }

  return breadcrumbs.length > 1 ? breadcrumbs : undefined;
};

// Map paths to header titles and subtitles
const getPageInfo = (pathname: string) => {
  // Check if exact match exists
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }

  // For nested routes, find the parent route
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 1) {
    const parentPath = `/${segments[0]}`;
    if (routeConfig[parentPath]) {
      // For nested routes, use the last segment as title
      const nestedTitle = segments[segments.length - 1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        title: nestedTitle,
        subtitle: routeConfig[parentPath].subtitle,
      };
    }
  }

  return {
    title: "Customer Dashboard",
    subtitle:
      "Welcome back! Monitor your EV battery status and find nearby swap stations.",
  };
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageInfo = getPageInfo(pathname);
  const breadcrumbs = generateBreadcrumbs(pathname, searchParams);

  return (
    <MainLayout
      sidebar={<CustomerSideBar currentPath={pathname} />}
      header={
        <CustomerHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          breadcrumbs={breadcrumbs}
        />
      }
    >
      {children}
    </MainLayout>
  );
}
