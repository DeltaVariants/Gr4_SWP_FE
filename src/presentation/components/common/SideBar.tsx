"use client";
import React from "react";
import { useAuth } from '@/contexts/AuthContext';
import Link from "next/link";
import { FaBars } from "react-icons/fa";

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
  isAdmin?: boolean;
}

const SideBar: React.FC<SideBarUIProps> = ({
  isExpanded,
  currentPath,
  navigationItems,
  onToggle,
  user,
  className = "",
  isAdmin = false,
}) => {
  const { user: authUser, loading: authLoading } = useAuth();

  // Prefer explicit prop `user`, then auth context, then try decoding token for an immediate name
  const tokenNameFallback = (() => {
    try {
      if (typeof window !== 'undefined') {
        const t = localStorage.getItem('accessToken');
        if (t) {
          const parts = t.split('.');
          if (parts.length >= 2) {
            const p = JSON.parse(atob(parts[1]));
            return p.unique_name || p.name || p.email || p.username || null;
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  })();

  const displayedName = user?.name || authUser?.name || tokenNameFallback || authUser?.email || "";
  const displayedAvatar = user?.avatarUrl || authUser?.avatar || undefined;
  const displayedInitials =
    user?.initials ||
    (displayedName
      ? displayedName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((s: string) => s[0].toUpperCase())
          .join("")
      : authLoading
      ? ''
      : 'NA');
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
          {isAdmin && (
            <span
              className={`text-2xl font-semibold text-gray-800 pl-10 whitespace-nowrap transition-opacity duration-200 ${
                isExpanded
                  ? "opacity-100 delay-150"
                  : "opacity-0 absolute left-full"
              }`}
            >
              Admin
            </span>
          )}
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
          // normalize currentPath: strip query and trailing slash
          const raw = (currentPath || '').toString();
          const normalized = raw.split('?')[0].replace(/\/+$/, '');
          const isProfilePage = normalized.toLowerCase().startsWith('/profile');
          const isActive = !isProfilePage && normalized === item.path.replace(/\/+$/, '');
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
            {displayedAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedAvatar}
                alt={displayedName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-700">
                {displayedInitials || "NA"}
              </span>
            )}
          </div>
          <div
            className={`transition-opacity duration-200 min-w-0 flex-1 ${
              isExpanded
                ? "opacity-100 delay-150"
                : "opacity-0 absolute left-full"
            }`}
          >
            {displayedName && (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-800 hover:underline truncate min-w-0 flex-1"
                  title={displayedName}
                >
                  {displayedName}
                </Link>

                <LogoutButton />
              </div>
            )}
            {user?.plan && (
              <p className="text-xs text-gray-500 truncate" title={user.plan}>
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

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      onClick={async () => {
        try {
          await logout();
        } catch (e) {
          // ignore
        }
      }}
      title="Logout"
      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    </button>
  );
}
