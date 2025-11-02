"use client";
import React from "react";
import { usePathname } from "next/navigation";
import MainLayout from "../../presentation/layouts/MainLayout";
import CustomerHeader from "./home/components/CustomerHeader";
import CustomerSideBar from "./home/components/CustomerSideBar";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

// Map paths to header titles and subtitles
const getPageInfo = (pathname: string) => {
  switch (pathname) {
    case "/home":
      return {
        title: "Home",
        subtitle:
          "Welcome back! Monitor your EV battery status and find nearby swap stations.",
      };
    case "/findstation":
      return {
        title: "Find Station",
        subtitle: "Locate nearby battery swap stations and check availability.",
      };
    case "/booking":
      return {
        title: "My Bookings",
        subtitle: "View and manage your battery swap reservations.",
      };
    case "/history":
      return {
        title: "Swap History",
        subtitle: "Review your past battery swap transactions and activity.",
      };
    case "/billing-plan":
      return {
        title: "Billing & Plans",
        subtitle: "Manage your subscription plans and payment methods.",
      };
    case "/support":
      return {
        title: "Support",
        subtitle: "Get help and contact our customer service team.",
      };
    default:
      return {
        title: "Customer Dashboard",
        subtitle:
          "Welcome back! Monitor your EV battery status and find nearby swap stations.",
      };
  }
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <MainLayout
      sidebar={<CustomerSideBar currentPath={pathname} />}
      header={
        <CustomerHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
      }
    >
      {children}
    </MainLayout>
  );
}
