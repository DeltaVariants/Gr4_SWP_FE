"use client";
import React from "react";
import Link from "next/link";
import { FaBars } from "react-icons/fa";
import Image from "next/image";

export type NavigationItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

export type UserInfo = {
  initials?: string;
  name?: string;
  plan?: string;
  avatarUrl?: string;
};

export interface SideBarUIProps {
  isExpanded: boolean;
  currentPath: string;
  navigationItems: NavigationItem[];
  onToggle: () => void;
  user?: UserInfo;
  className?: string;
}

const SideBar: React.FC<SideBarUIProps> = ({
  isExpanded,
  currentPath,
  navigationItems,
  onToggle,
  user,
  className = "",
}) => {
  return (
    <div
      className={`h-screen flex flex-col sticky top-0 z-10 transition-all duration-300 ease-in-out bg-white shadow-[0_4px_4px_rgba(0,0,0,0.1)] ${
        isExpanded ? "w-60" : "w-22"
      } ${className}`}
    >
      {/* Logo Section*/}
      <div
        className={`p-4 pl-6 flex items-center flex-shrink-0 border-b border-gray-200`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10  rounded-full flex items-center justify-center flex-shrink-0">
            {/* Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/eSwap_Logo_1.png"
              alt="eSwap Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div className={`p-4 flex justify-start border-b border-gray-200`}>
        <button
          onClick={onToggle}
          className="bg-transparent border-none cursor-pointer p-4 rounded-lg flex items-center justify-center transition-colors duration-200 text-gray-700 hover:bg-indigo-100"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 flex flex-col gap-2">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link href={item.path} key={item.name}>
              <div
                className={`flex items-center px-4 py-4 cursor-pointer transition-all duration-200 mx-4 rounded-xl gap-4 ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-indigo-100 hover:text-gray-900"
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
                      : "opacity-0 absolute left-full"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div
          className={`ml-1.5 flex items-center ${
            isExpanded ? "space-x-3" : ""
          }`}
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-700">
                {user?.initials || "NA"}
              </span>
            )}
          </div>
          <div
            className={`transition-opacity duration-200 ${
              isExpanded
                ? "opacity-100 delay-150"
                : "opacity-0 absolute left-full"
            }`}
          >
            {user?.name && (
              <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                {user.name}
              </p>
            )}
            {user?.plan && (
              <p className="text-xs text-gray-500 whitespace-nowrap">
                {user.plan}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
