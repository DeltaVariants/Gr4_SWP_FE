'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import SideBar, { NavigationItem, UserInfo } from '@/presentation/components/common/SideBar';
import { HiHome, HiClipboardCheck, HiViewGrid, HiDocumentReport, HiCalendar, HiSwitchHorizontal } from 'react-icons/hi';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const navigationItems: NavigationItem[] = useMemo(
    () => [
      { name: 'Dashboard', path: '/dashboardstaff', icon: <HiHome size={18} /> },
      { name: 'Check-in', path: '/check-in', icon: <HiClipboardCheck size={18} /> },
      { name: 'Inventory', path: '/inventory', icon: <HiViewGrid size={18} /> },
      { name: 'Reports', path: '/reports', icon: <HiDocumentReport size={18} /> },
      { name: 'Reservations', path: '/reservations', icon: <HiCalendar size={18} /> },
      { name: 'Swap', path: '/swap', icon: <HiSwitchHorizontal size={18} /> },
    ],
    []
  );

  const userInfo: UserInfo = {
    initials: user?.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'EM',
    name: user?.name || 'Employee',
    plan: user?.role || 'Employee',
    avatarUrl: user?.avatar,
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <SideBar
        isExpanded={isExpanded}
        currentPath={pathname || '/dashboardstaff'}
        navigationItems={navigationItems}
        onToggle={() => setIsExpanded((prev) => !prev)}
        user={userInfo}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 space-y-6 max-w-full overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
