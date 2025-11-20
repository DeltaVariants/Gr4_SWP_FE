"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  id: string;
  label: string;
  href: string;
}

interface TabsNavProps {
  tabs: Tab[];
  children?: React.ReactNode;
}

const TabsNav: React.FC<TabsNavProps> = ({ tabs, children }) => {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
      <div className="border-b border-gray-200 shrink-0">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  transition-colors duration-200
                  ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children && <div className="p-6 flex-1 overflow-auto">{children}</div>}
    </div>
  );
};

export default TabsNav;
